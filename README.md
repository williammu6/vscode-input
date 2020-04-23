<div align="center">
    <img src="./assets/logo.png">
    <h3><strong>VSCode Input</strong></h3>
</div>

<b>VSCode Input</b> is a extension for VScode which executes the program of the current open file and feeds as <b>STDIN input</b> the values provided in commends.

The input is obtained through the commends written on top of the file like the examples shown in [Usage](#usage)

> Inspirated by [Sublime Input](https://packagecontrol.io/packages/Sublime%20Input)

# Configuration

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
    while (cin >> s) {
        cout << s << endl;
    }
    return 0;
}
```

Output

```console
string_1
string_2
string_3
```

## Keyboard Shortcuts

- Ctrl + Alt + b - Builds and runs the program (⌘⇧B for Mac)
- Ctrl + Alt + c - Builds and runs the program (⌘⇧C for Mac)
