cmake_minimum_required(VERSION 3.20)
project(streaming LANGUAGES CXX) 
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON) 
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
find_package(Crow CONFIG REQUIRED) 
find_package(libpqxx CONFIG REQUIRED)
find_package(TagLib REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
set(SOURCES
  src/main.cpp
  src/database.h
)
add_executable(${PROJECT_NAME} ${SOURCES}) 
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src)
target_link_libraries (${PROJECT_NAME} PRIVATE
   Crow::Crow
   libpqxx::pqxx
   TagLib::TagLib
   nlohmann_json::nlohmann_json
)
