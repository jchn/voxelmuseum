Voxelmuseum
===========

This was a project for BCI (Business Case Innovative Technology) on the Rotterdam University of Applied Sciences.

Goal
------------

The goal was to turn an oridnary web page into more of an experience by making an 3d environment in which content can be consumed.

Status
-------------

At the moment the project isn't finished but there is something which may be considered as a first alpha version. The very basics are there but it's still very buggy and is very likely to crash.

Technical details
-----------------

With the use of [express.io][1] and the [instagram api][2] ( with the help of [instagram-node-lib][4] ), pictures taken with a user defined tag will appear in real time. Data is transferred using websockets to the clients. The world itself consists of voxels which was built using the [voxeljs][3] library.

[1]: https://github.com/techpines/express.io "express.io"
[2]: http://instagram.com/developer/realtime/ "instagram api"
[3]: http://voxeljs.com "voxeljs"
[4]: https://github.com/mckelvey/instagram-node-lib "instagram-node-lib"