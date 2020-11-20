import { boundMethod } from "autobind-decorator";

interface ICodeStreamOptions {
    indentationSize: number;
}

export default class CodeStream {
    private depth = 0;
    private value = '';
    private getDefaultOptions(): ICodeStreamOptions {
        return {
            indentationSize: 4
        };
    };
    private readonly options: ICodeStreamOptions;
    public constructor(
        private readonly parent?: CodeStream,
        options?: Partial<ICodeStreamOptions>
    ) {
        this.options = options ? {
            ...this.getDefaultOptions(),
            ...options
        } : {
            ...this.getDefaultOptions()
        };
    }
    @boundMethod public reset() {
        const {value} = this;
        this.value = '';
        return value;
    }
    /**
     * Indent the first write and then append the rest
     */
    public add(first: string, ...items: string[]) {
        this.write(first);
        this.append(...items);
    }
    /**
     * Shortcut to append(indent(start))
     */
    public write(start: string): void;
    public write(start: string, write: () => void, end: string): void;
    @boundMethod public write(start: string, write?: () => void, end?: string) {
        this.append(this.indent(start));
        if(typeof write === 'undefined' || typeof end === 'undefined') {
            return;
        }
        this.indentBlock(write);
        this.write(end);
    }
    @boundMethod public indentBlock(value: () => void) {
        this.increaseDepth();
        value();
        this.decreaseDepth();
    }
    @boundMethod public append(...items: string[]) {
        for(const value of items) {
            this.value += value;
        }
    }
    private indent(value: string) {
        for(let i = 0; i < ((this.parent ? this.parent : this).depth); i++) {
            for(let j = 0; j < this.options.indentationSize; j++) {
                value = ' ' + value; 
            }
        }
        return value;
    }    
    private updateDepth(fn: (current: number) => number) {
        if(this.parent) {
            this.parent.updateDepth(fn);
            return;
        }
        this.depth = fn(this.depth);
    }
    private increaseDepth() {
        this.updateDepth(depth => depth + 1);
    }
    private decreaseDepth() {
        this.updateDepth(depth => depth - 1);
    }
}
