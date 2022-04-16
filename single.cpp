#include <cstdio>
#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>
#include <array>

void exec(const char* cmd) {
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd, "r"), pclose);
    
    if (!pipe) throw std::runtime_error("popen() failed!");
}

int main() {
    int i = 0;
    while (true) {
        exec(("git commit --allow-empty -m \"" + std::to_string(i) + "\"").c_str());
        std::cout << ++i << std::endl;
    }
}