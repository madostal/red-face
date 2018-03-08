# Red Face - security testing of web applications

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a7c3925f9a224d52a5d079b77c83d24e)](https://www.codacy.com/app/JaLe29/red-face?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=JaLe29/red-face&amp;utm_campaign=Badge_Grade)

## What is Red Face

* It's my diploma thesis - [Faculty of Applied Sciences of the University of West Bohemia in Pilsen](http://www.fav.zcu.cz/en/)
* Red Face is web applications which is created for web security testing
* APP is using React/SemanticUI views and uses a REST JSON API with MySQL database

## Types of security tests

* Brute Force
* XSS
* SQL Injection
* Path Traversal 
* Form action hijacking
* Inline JS
* https vs https
* CORS
* Git config
* Scan ports

## Currently used frameworks:

* [Babel](https://babeljs.io/)
* [React Semantic UI](http://react.semantic-ui.com/)
* [Webpack](http://webpack.github.io/)
* [ES6](https://babeljs.io/docs/learn-es2015/)
* [React](https://facebook.github.io/react/)
* [React Router](https://github.com/reactjs/react-router)
* [ESLint](https://eslint.org/)

## Other Features

* Seemless pushState routing using React Router
* Uses Webpack/HTMLWebpackPlugin to generate an index.html that has cache friendly bundle loaders
* All CSS and assets served via Webpack/StyleLoader
* Uses Semantic UI as a rich UI element base
* Bundles are split between vendor and app for better bundling/loading performance
* All files are organized according to modern conventions. Component directory structure allows for expansion of multiple apps / subdomains
* Uses ES6 style React components
* Code hotswapping

## Before start
* Generate db using `script.sql` in root folder
* Set up db in `backend\utils\database.js`
* Set up url for backend in frontend app in `frontend\src\utils\Api.js`

## Install Dependencies

Run in the project `frontend` and `backend` folder:

```bash
npm install
```

## Run

The following command serves all HTML/JS/CSS and watches all changes to `src/*.jsx`
In `frontend` folder
```bash
npm start
```
UI is running at [http://localhost:3000/](http://localhost:3000/)

# Build
In `frontend` folder, you can create production build 
```bash
npm build
```
## Running the API
In `backend` folder
```bash
node script/api.js
```

## Directory Structure

* `frontend` - UI in React
* `backend` - backendservice in NodeJS

## Note

* The project is building from Simple JS App Skeleton [https://github.com/dominiek/app-skeleton](https://github.com/dominiek/app-skeleton) - Thank you dominiek

## Contact
Bc. Jakub Löffelmann <<jakubloffelmann@gmail.com>>

