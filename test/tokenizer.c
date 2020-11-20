#include "../src/tokenizer.h"

#include <assert.h>

#define EL_ASSERT(expr) \
    assert(expr == EL_RESULT_OK);

void test_tokenizer() {
    struct el_tokenizer t;
    EL_ASSERT(el_tokenizer_init(&t));
    EL_ASSERT(el_tokenizer_scan(&t, "entity Player {}"));

    el_tokenizer_destroy(&t);
}
