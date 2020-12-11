# Class Scheduler

## Description
Class Scheduler is an open-source project developed in Python3.  Many classes have prerequisites that students must take 
before they can take that course. Class Scheduler aims to help students efficiently finds an order that they can take each of
the courses where all the prerequisites are satisfied.

## Dependencies

There is no any third-party libraries embedded in this project. 

## Build Instructions and Usage

Because Python is an interpreted language, we do not need to build it as executable. Make sure **[Python3](https://www.python.org/downloads/)** is installed on your computer. To run this project, the only argument that must be passed will be a path to a **json** file containing class names and prerequisites
For **Mac** Users, open the terminal, navigate to the project root folder, and execute:
```sh
 ./scheduler.sh tests/FILE_NAME
 ```
For **Windows** Users open Powershell, navigate to the project root folder, and execute: 
```sh
 .\scheduler.sh tests\FILE_NAME
 ```
 The output will be valid ordering of classes, see example below: 
 ![math](./img/math.png)
 ![example](./img/example.png)

## Algorithm Specification
* I used the topoplogical sort algorithm to solve this problem. This problem is tightly related to relationship between 
multiple courses, which quickly reminds me about the use of directed graph structure. We can imagine each course 
as a vertice, and each prerequisite relation (eg: Class: Differential Equations, Prerequisite: Calculus) as 
an edge. The final answer of 
this problem will be a topological sort list. 
* Algortihm steps
    1. Build the graph and record the in-degree of each course.
    2. Add a vertice into a queue and the topological sort list if it has 0 in-degree.
    3. For each vertice in the queue, iterate each of its neighbors, and minus one for each of its in-degree. When a in-degree.
    reduces to 0, add the vertice to the queue
    4. repeat step 3 until the queue has no value.
    5. Check if the length of the topolical sort list equals to the number of vertices. If true, that means a topological.
    sort is satisfied.
![topological](./img/topological.jpeg)

## Complexities
 * **Speed** Complexity: O(V + E)

* **Space** Complexity: O(V + E)
* V is the number of vertices, while E is the number of edges.


## Trouble Shooting
 * If the shell script cannot be exucuted, try to add ```bash``` in front of the command or execute this command first ```chmod u+x scheduler.sh```

