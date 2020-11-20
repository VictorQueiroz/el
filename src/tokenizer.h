#ifndef EL_TOKENIZER_H_
#define EL_TOKENIZER_H_

#include "el.h"
#include "char_list.h"
#include "token_list.h"

#include <stddef.h>
#include <string.h>

struct el_tokenizer {
    struct el_token_list tokens;
    struct el_char_list text;
};

enum el_result el_tokenizer_scan(struct el_tokenizer* t, char*);
enum el_result el_tokenizer_init(struct el_tokenizer*);
void el_tokenizer_destroy(struct el_tokenizer*);

#endif // EL_TOKENIZER_H_
