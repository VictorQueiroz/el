#ifndef EL_EL_CHAR_LIST_H_
#define EL_EL_CHAR_LIST_H_
#include <string.h>
#include "el.h"
#include <string.h>
#include <stdlib.h>
#include <stdint.h>
struct el_char_list {
    uint32_t size;
    uint32_t capacity;
    char* data;
};
enum el_result el_char_list_push(struct el_char_list* list, char item);
enum el_result el_char_list_copy(struct el_char_list* list, uint32_t size, char* item);
enum el_result el_char_list_resize(struct el_char_list* list, uint32_t size);
enum el_result el_char_list_reserve(struct el_char_list* list, uint32_t length);
enum el_result el_char_list_init(struct el_char_list* list);
void el_char_list_destroy(struct el_char_list* list);
enum el_result el_char_list_alloc(struct el_char_list** list);
#endif // EL_EL_CHAR_LIST_H_
