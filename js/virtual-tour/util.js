
export class Util{

	static AngleUnit = {
	  DEGREE: 'degree',
	  RADIAN: 'radian',
	};
	
	// Direct aliases for convenience
	static DEGREE = Util.AngleUnit.DEGREE;
	static RADIAN = Util.AngleUnit.RADIAN;

	static convertRotation(inArray, angleUnit = Util.DEGREE) {
		if(inArray.length==4){
			return inArray;
		}else if(inArray.length==3){
			let [x, y, z] = inArray;

				if(angleUnit == Util.DEGREE){
					// degree → radian
					x = x * Math.PI / 180;
					y = y * Math.PI / 180;
					z = z * Math.PI / 180;
				}

				const cx = Math.cos(x / 2);
				const sx = Math.sin(x / 2);
				const cy = Math.cos(y / 2);
				const sy = Math.sin(y / 2);
				const cz = Math.cos(z / 2);
				const sz = Math.sin(z / 2);

				const qw = cx * cy * cz + sx * sy * sz;
				const qx = sx * cy * cz - cx * sy * sz;
				const qy = cx * sy * cz + sx * cy * sz;
				const qz = cx * cy * sz - sx * sy * cz;

				return [qx, qy, qz, qw];
				
			}else{
				// invalid!
			}
	}

	static toEuler(inArray, angleUnit = Util.DEGREE) {
		if(inArray.length==3){
				return inArray;
		}else if(inArray.length==4){
			const [x, y, z, w] = inArray;

		// Roll (X-Achse)
		const sinr_cosp = 2 * (w * x + y * z);
		const cosr_cosp = 1 - 2 * (x * x + y * y);
		let roll = Math.atan2(sinr_cosp, cosr_cosp);

		// Pitch (Y-Achse)
		const sinp = 2 * (w * y - z * x);
		let pitch;

		if (Math.abs(sinp) >= 1) {
		// Gimbal-Lock: auf ±90° begrenzen
		pitch = Math.sign(sinp) * Math.PI / 2;
		} else {
		pitch = Math.asin(sinp);
		}

		// Yaw (Z-Achse)
		const siny_cosp = 2 * (w * z + x * y);
		const cosy_cosp = 1 - 2 * (y * y + z * z);
		let yaw = Math.atan2(siny_cosp, cosy_cosp);

		if(angleUnit == Util.DEGREE){
						// degree → radian
						roll = roll * 180 / Math.PI;
						pitch = pitch * 180 / Math.PI;
						yaw = yaw * 180 / Math.PI;
					}

		return [roll, pitch, yaw];
	}
	
	}

 /**
 * Verkettet zwei Quaternionen.
 *
 * Ergebnis:
 *   q = q1 * q2
 *
 * Bedeutung:
 *   Zuerst wird q2 angewendet,
 *   danach q1.
 *
 * Alle Quaternionen haben das Format:
 *   [x, y, z, w]
 */
static multQ(q1, q2) {
  if (!q1 || q1.length !== 4 || !q2 || q2.length !== 4) {
    throw new Error(
      "multiplyQuaternions erwartet zwei Quaternionen [x, y, z, w]"
    );
  }

  const [x1, y1, z1, w1] = q1;
  const [x2, y2, z2, w2] = q2;

  const x =
    w1 * x2 +
    x1 * w2 +
    y1 * z2 -
    z1 * y2;

  const y =
    w1 * y2 -
    x1 * z2 +
    y1 * w2 +
    z1 * x2;

  const z =
    w1 * z2 +
    x1 * y2 -
    y1 * x2 +
    z1 * w2;

  const w =
    w1 * w2 -
    x1 * x2 -
    y1 * y2 -
    z1 * z2;

  // Optional normalisieren
  const len = Math.hypot(x, y, z, w);

  if (len === 0) {
    return [0, 0, 0, 1];
  }

  return [
    x / len,
    y / len,
    z / len,
    w / len
  ];
}
 
 
	static toEuler2(inArray, angleUnit = Util.DEGREE) {
		if(inArray.length==3){
				return inArray;
		}else if(inArray.length==4){
		let [qx, qy, qz, qw] = inArray;

  // Optional normalisieren
  const len = Math.hypot(qx, qy, qz, qw);
  if (len > 0) {
    qx /= len;
    qy /= len;
    qz /= len;
    qw /= len;
  }

  // Rotationmatrixelemente
  const m11 = 1 - 2 * (qy * qy + qz * qz);
  const m12 = 2 * (qx * qy - qz * qw);
  const m13 = 2 * (qx * qz + qy * qw);

  const m23 = 2 * (qy * qz - qx * qw);
  const m33 = 1 - 2 * (qx * qx + qy * qy);

  // Extraktion für Reihenfolge XYZ
  let x, y, z;

  y = Math.asin(Math.max(-1, Math.min(1, m13)));

  if (Math.abs(m13) < 0.9999999) {
    x = Math.atan2(-m23, m33);
    z = Math.atan2(-m12, m11);
  } else {
    // Gimbal Lock
    x = Math.atan2(
      2 * (qx * qw - qy * qz),
      1 - 2 * (qx * qx + qz * qz)
    );
    z = 0;
  }

if(angleUnit == Util.DEGREE){
						// degree → radian
						x = x * 180 / Math.PI;
						y = y * 180 / Math.PI;
						z = z * 180 / Math.PI;
					}


  return [x, y, z];
}
	}


  static roundRect(context, x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

}