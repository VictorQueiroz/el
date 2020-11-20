#ifndef EL_H_
#define EL_H_

enum el_result {
    EL_RESULT_OK = 0,
    EL_RESULT_MEMORY_ALLOCATION_FAILED = -1
};

#define EL_CALL(expr) \
    { \
        enum el_result __result__ = expr; \
        if(__result__ != EL_RESULT_OK) { \
            return __result__; \
        } \
    }

#endif // EL_H_
