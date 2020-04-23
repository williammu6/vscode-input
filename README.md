<center><img src="./assets/logo.png" alt="logo" width="200"/></center>

<h3 align="center"><strong>VSCode Input</strong></h3>

<b>VSCode Input</b> is a extension for VScode which executes the program of the current open file and feeds as <b>STDIN input</b> the values provided in commends.

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
