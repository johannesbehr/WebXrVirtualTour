// quaternion.js

export class Quaternion {
  constructor(arr) {
    if (!Array.isArray(arr) || arr.length !== 4) {
      throw new Error("Quaternion erwartet [x,y,z,w]");
    }
    this.x = arr[0];
    this.y = arr[1];
    this.z = arr[2];
    this.w = arr[3];
	}

  toArray() {
    return [this.x, this.y, this.z, this.w];
  }
}