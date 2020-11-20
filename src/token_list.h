#ifndef EL_EL_TOKEN_LIST_H_
#define EL_EL_TOKEN_LIST_H_
#include "token.h"
#include "el.h"
#include <string.h>
#include <stdlib.h>
#include <stdint.h>
struct el_token_list {
    uint32_t size;
    uint32_t capacity;
    struct el_token* data;
};
enum el_result el_token_list_push(struct el_token_list* list, struct el_token item);
enum el_result el_token_list_copy(struct el_token_list* list, uint32_t size, struct el_token* item);
enum el_result el_token_list_resize(struct el_token_list* list, uint32_t size);
enum el_result el_token_list_reserve(struct el_token_list* list, uint32_t length);
enum el_result el_token_list_init(struct el_token_list* list);
void el_token_list_destroy(struct el_token_list* list);
enum el_result el_token_list_alloc(struct el_token_list** list);
#endif // EL_EL_TOKEN_LIST_H_
