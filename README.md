<h1 align="center"><img src="assets/logo.png" height="128"><br>VSCode Input</h1>
<p align="center"><strong>STDIN Input for C++ and Python programs through comment</strong></p>

<b>VSCode Input</b> is a extension for VScode which executes the program of the current open file and feeds as <b>STDIN input</b> the values provided in input comment.

The input is obtained through the comments written on top of the file like the examples shown in [Usage](#usage)

> Inspirated by [Sublime Input](https://packagecontrol.io/packages/Sublime%20Input)

# VSCode Input Settings

It is possible to change path to executable and execution flags via <i>Preferences: Open Settings</i>.


Name | Description
--- | ---
vscode-input.compile-command.cpp | Specifies the compile command to run C++. You can add or remove flags if it's necessary, such as -std=c++-17.
vscode-input.run-command.py |  Specifies the command to execute program


# Usage

C++

```c++
/**input
3
string_1
string_2
string_3
*/
#include <bits/stdc++.h>

using namespace std;

int main() {
    int t;
    string s;

    cin >> t
    while (t--) {
        cin >> s;
        cout << s << endl;
    }
    return 0;
}
```

Python 3

```python
"""input
3
string_1
string_2
string_3
"""
t = int(input())

while True:

    if t <= 0:
        break

    print(input())

    t -= 1
```

Output

```console
string_1
string_2
string_3
```

## Keyboard Shortcuts

- Ctrl + Alt + b - vscode-input.Build - Builds and runs the program (⌘⇧B for Mac)
- Ctrl + Alt + c - vscode-input.Cancel - Cancels current running program (⌘⇧C for Mac)
