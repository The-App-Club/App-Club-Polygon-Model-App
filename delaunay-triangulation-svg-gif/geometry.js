// Constrained Delaunay Triangulation code in JavaScript
// Copyright 2018 Savithru Jayasinghe
// Licensed under the MIT License

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  dot(p1) {
    return this.x * p1.x + this.y * p1.y;
  }

  add(p1) {
    return new Point(this.x + p1.x, this.y + p1.y);
  }

  sub(p1) {
    return new Point(this.x - p1.x, this.y - p1.y);
  }

  scale(s) {
    return new Point(this.x * s, this.y * s);
  }
}

function cross(vec0, vec1) {
  return vec0.x * vec1.y - vec0.y * vec1.x;
}

function getPointOrientation(edge, p) {
  const vec_edge01 = edge[1].sub(edge[0]);
  const vec_edge0_to_p = p.sub(edge[0]);
  return cross(vec_edge01, vec_edge0_to_p);
}
