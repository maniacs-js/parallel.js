# Contributing

Contributions to this repository will be gladly received, given they follow these coding standards and styles.

### Code Style

Code style is equivalent to the Visual Studio default code formatting settings, namely:

* Tabs
* When using anonymous functions, put a space between function and the parenthesis ```function () {```
* No spaces around parameters, only after commas
* Use semicolons
* No newline before curly braces, always newline for ending curly braces
* Single quotes for strings
* Always test every single stage. If you change something and it's testable, there **has** to be a test
    * Adding test results to the pull request comments will **always be well received**
* Provide updates in the form of comments on [issues](https://github.com/MaXwellFalstein/Parallel2.js/Issues) raised and related to your fork

---

### Examples

    function Operation() {
        this._callbacks = [];
        this._errCallbacks = [];

        this._resolved = 0;
        this._result = null;
    }

---
