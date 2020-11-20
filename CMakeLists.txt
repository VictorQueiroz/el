project(el C)
cmake_minimum_required(VERSION 3.18)

set(CMAKE_C_STANDARD 99)

add_library(el SHARED src/tokenizer.c src/token_list.c src/char_list.c)
target_include_directories(el PUBLIC src)

add_executable(el_test test/main.c test/tokenizer.c)
target_link_libraries(el_test PRIVATE el)
