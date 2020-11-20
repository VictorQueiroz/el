#include "tokenizer.h"

enum el_result el_tokenizer_init(struct el_tokenizer* t) {
    EL_CALL(el_char_list_init(&t->text));
    EL_CALL(el_token_list_init(&t->tokens));
    return EL_RESULT_OK;
}

enum el_result el_tokenizer_scan(struct el_tokenizer* t, char* value) {
    EL_CALL(el_char_list_copy(&t->text, strlen(value), value));
    return EL_RESULT_OK;
}

void el_tokenizer_destroy(struct el_tokenizer* t) {
    el_token_list_destroy(&t->tokens);
    el_char_list_destroy(&t->text);
}
