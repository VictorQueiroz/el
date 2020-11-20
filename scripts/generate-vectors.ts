import CodeStream from './CodeStream';
import * as fs from 'fs';
import * as path from 'path';

const result = `enum el_result`;

const defaultIncludes = [
    'el.h',
    '<string.h>',
    '<stdlib.h>'
];

export interface IVectorInfo {
    type: string;
    name: string;
    file: string;
    destination: string;
    list: string;
    includes?: string[];
    // callbacks?: {
    //     /**
    //      * If present, the code generator will run `freeItem`
    //      * when the vector is destroy so you can free vector items.
    //      */
    //     freeItem: string;
    // };
}

const vectors: IVectorInfo[] = [
    {
        destination: '../src',
        includes: ['token.h'],
        type: 'struct el_token',
        file: 'token_list',
        list: 'struct el_token_list',
        name: 'el_token_list'
    },
    {
        destination: '../src',
        includes: ['<string.h>'],
        type: 'char',
        file: 'char_list',
        list: 'struct el_char_list',
        name: 'el_char_list'
    }
];

function generateListType(info: IVectorInfo, parent?: CodeStream) {
    const {reset, write} = new CodeStream(parent);
    write(`struct ${info.name} {\n`, () => {
        write(`uint32_t size;\n`)
        write(`uint32_t capacity;\n`)
        write(`${info.type}* data;\n`)
    }, '};\n');
    return reset();
}

const methods: {
    includes?: string[];
    declaration: (info: IVectorInfo) => string;
    leadingComment?: (info: IVectorInfo, parent?: CodeStream) => string;
    definition: (info: IVectorInfo, parent?: CodeStream) => string;
}[] = [
    {
        declaration: info => (
            `${result} ${info.name}_push(${info.list}* list, ${info.type} item)`
        ),
        definition: (info, parent) => {
            const {write, reset} = new CodeStream(parent);
            write(`EL_CALL(${info.name}_reserve(list, 1));\n`);
            write(`list->data[list->size++] = item;\n`);
            write(`return EL_RESULT_OK;\n`);
            return reset();
        }
    },
    {
        declaration: info => (
            `${result} ${info.name}_copy(${info.list}* list, uint32_t size, ${info.type}* item)`
        ),
        definition: (info, parent) => {
            const {write, reset} = new CodeStream(parent);
            write(`EL_CALL(${info.name}_reserve(list, size));\n`);
            write(`memcpy(list->data, item, sizeof(${info.type}) * size);\n`);
            write(`list->size += size;\n`);
            write(`return EL_RESULT_OK;\n`);
            return reset();
        }
    },
    {
        declaration: info => (
            `${result} ${info.name}_resize(${info.list}* list, uint32_t size)`
        ),
        definition: (info, parent) => {
            const {write, reset} = new CodeStream(parent);
            write(`if(size > 0) EL_CALL(${info.name}_reserve(list, size));\n`);
            write(`list->size = size;\n`);
            write(`return EL_RESULT_OK;\n`);
            return reset();
        }
    },
    {
        includes: ['<stdint.h>'],
        leadingComment: (_,parent) => {
            const cs = new CodeStream(parent);
            cs.write(`/**\n`)
            cs.write(` * Make sure there is \`length\` items unused in the vector. If there isn't, try to\n`)
            cs.write(` * reallocate the memory and if that fails, it'll return EL_RESULT_MEMORY_ALLOCATION_FAILED.\n`)
            cs.write(` */\n`)
            return cs.reset();
        },
        declaration: info => (
            `${result} ${info.name}_reserve(${info.list}* list, uint32_t length)`
        ),
        definition: (info, parent) => {
            const {write, reset} = new CodeStream(parent);
            write(`if((list->capacity - list->size) > length) {\n`, () => {
                write(`list->capacity += length + (list->capacity * 2);\n`)
                write(`list->data = realloc(list->data, list->capacity * sizeof(${info.type}));\n`);
                write(`if(!list->data) {\n`, () => {
                    write(`return EL_RESULT_MEMORY_ALLOCATION_FAILED;\n`);
                }, '}\n');
            },'}\n');
            write(`return EL_RESULT_OK;\n`);
            return reset();
        }
    },
    {
        declaration: (info) => {
            return `${result} ${info.name}_init(${info.list}* list)`;
        },
        definition: (info, parent) => {
            const {
                reset,
                write
            } = new CodeStream(parent);
            write(`list->capacity = 20;\n`);
            write(`list->size = 0;\n`);
            write(`list->data = malloc(sizeof(${info.list}) * list->capacity);\n`);
            write(`if(!list->data) {\n`, () => {
                write(`return EL_RESULT_MEMORY_ALLOCATION_FAILED;\n`);
            },'}\n');
            write(`return EL_RESULT_OK;\n`);
            return reset();
        }
    },
    {
        declaration: (info) => {
            return `void ${info.name}_destroy(${info.list}* list)`;
        },
        definition: (_, parent) => {
            const {
                reset,
                write
            } = new CodeStream(parent);
            write(`if(list->data) free(list->data);\n`);
            return reset();
        }
    },
    {
        declaration: (info) => {
            return `${result} ${info.name}_alloc(${info.list}** list)`;
        },
        definition: (info, parent) => {
            const {
                reset,
                write
            } = new CodeStream(parent);
            write(`*list = malloc(sizeof(${info.list}) * 1);\n`);
            write(`if(!(*list)) return EL_RESULT_MEMORY_ALLOCATION_FAILED;\n`);
            write(`EL_CALL(${info.name}_init(*list));\n`);
            write(`return EL_RESULT_OK;\n`);
            return reset();
        }
    }
];

const getIncludes = (includes?: ReadonlyArray<string>): ReadonlyArray<string> => {
    if(!includes) {
        return [];
    }
    return includes.map(i => {
        if(!i.startsWith('<')) {
            i = `"${i}"`;
        }
        return i;
    });
};

async function run() {
    for(const v of vectors) {
        const header = new CodeStream();
        const headId = `EL_${v.name.replace(
            /[a-z]+/gim,
            v => v.toUpperCase()
        )}_H_`;

        header.write(`#ifndef ${headId}\n`)
        header.write(`#define ${headId}\n`)

        const includes = [
            ...(v.includes || []),
            ...defaultIncludes
        ];

        for(const m of methods) {
            if(m.includes) {
                for(const i of m.includes) {
                    if(includes.indexOf(i) === -1) {
                        includes.push(i);
                    }
                }
            }
        }

        for(const i of getIncludes(includes)) {
            header.write(`#include ${i}\n`);
        }

        header.append(generateListType(v));

        for(const m of methods) {
            if(m.leadingComment) {
                m.leadingComment(v, header);
            }
            header.add(m.declaration(v), ';\n');
        }
        header.write(`#endif // ${headId}\n`)

        await fs.promises.writeFile(
            path.resolve(path.resolve(__dirname,v.destination),`${v.file}.h`),
            header.reset()
        );

        const source = new CodeStream();

        source.write(`#include "${v.file}.h"\n`);

        for(const m of methods) {
            if(m.leadingComment) {
                m.leadingComment(v, header);
            }
            source.write(m.declaration(v));
            source.append('{\n')
            source.indentBlock(() => {
                source.append(m.definition(v, source));
            });
            source.write('}\n');
        }

        await fs.promises.writeFile(
            path.resolve(path.resolve(__dirname,v.destination),`${v.file}.c`),
            source.reset()
        );
    }
}

run().catch(reason => {
    console.error(reason);
    process.exitCode = 1;
});
