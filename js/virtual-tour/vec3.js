// Vec3.js

export class Vec3 {
  constructor(arr) {
    if (!Array.isArray(arr) || arr.length !== 3) {
      throw new Error("Vec3 erwartet [x,y,z]");
    }
    this.x = arr[0];
    this.y = arr[1];
    this.z = arr[2];
  }

  toArray() {
    return [this.x, this.y, this.z];
  }
}