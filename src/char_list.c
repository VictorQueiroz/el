#include "char_list.h"
enum el_result el_char_list_push(struct el_char_list* list, char item){
    EL_CALL(el_char_list_reserve(list, 1));
    list->data[list->size++] = item;
    return EL_RESULT_OK;
}
enum el_result el_char_list_copy(struct el_char_list* list, uint32_t size, char* item){
    EL_CALL(el_char_list_reserve(list, size));
    memcpy(list->data, item, sizeof(char) * size);
    list->size += size;
    return EL_RESULT_OK;
}
enum el_result el_char_list_resize(struct el_char_list* list, uint32_t size){
    if(size > 0) EL_CALL(el_char_list_reserve(list, size));
    list->size = size;
    return EL_RESULT_OK;
}
enum el_result el_char_list_reserve(struct el_char_list* list, uint32_t length){
    if((list->capacity - list->size) > length) {
        list->capacity += length + (list->capacity * 2);
        list->data = realloc(list->data, list->capacity * sizeof(char));
        if(!list->data) {
            return EL_RESULT_MEMORY_ALLOCATION_FAILED;
        }
    }
    return EL_RESULT_OK;
}
enum el_result el_char_list_init(struct el_char_list* list){
    list->capacity = 20;
    list->size = 0;
    list->data = malloc(sizeof(struct el_char_list) * list->capacity);
    if(!list->data) {
        return EL_RESULT_MEMORY_ALLOCATION_FAILED;
    }
    return EL_RESULT_OK;
}
void el_char_list_destroy(struct el_char_list* list){
    if(list->data) free(list->data);
}
enum el_result el_char_list_alloc(struct el_char_list** list){
    *list = malloc(sizeof(struct el_char_list) * 1);
    if(!(*list)) return EL_RESULT_MEMORY_ALLOCATION_FAILED;
    EL_CALL(el_char_list_init(*list));
    return EL_RESULT_OK;
}
