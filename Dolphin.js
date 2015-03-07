Dolphin = function (object,controls, maxX) {

    var scope = this;

    this.scale = 1;

    // movement model parameters

    this.maxSpeed = 275;
    this.maxReverseSpeed = -275;

    this.frontAcceleration = 600;
    this.backAcceleration = 600;



    this.frontDecceleration = 600;

    this.angularSpeed = 2.5;
    this.maxX = maxX | 2000;

    // rig

    this.root = object;
    this.controls = controls;


    // internal movement control variables

    this.speed = 0;
    this.bodyOrientation = 0;

    this.walkSpeed = this.maxSpeed;
    this.crouchSpeed = this.maxSpeed * 0.5;

    // API

    this.update = function (delta) {

        if (this.controls) this.updateMovementModel(delta);

    };

    this.updateMovementModel = function (delta) {

        var controls = this.controls;

        // speed based on controls

        if (controls.crouch) this.maxSpeed = this.crouchSpeed;
        else this.maxSpeed = this.walkSpeed;

        this.maxReverseSpeed = -this.maxSpeed;

        if (controls.moveForward) this.speed = THREE.Math.clamp(this.speed + delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed);
        if (controls.moveBackward) { }// this.speed = THREE.Math.clamp(this.speed - delta * this.backAcceleration, this.maxReverseSpeed, this.maxSpeed);
        if (controls.jump)
        {
           var time = performance.now() * 0.001;

            var tmp = Math.sin(5*time) * 300 + 300;
            if (tmp >20)
            {
                this.root.position.y = tmp;
                controls.jump = true;
            }
            else
            {
                this.root.position.y = 20;
                controls.jump = false;
            }
        }
        

        var dir = 1;

        if (controls.moveLeft) {
            
            if (this.bodyOrientation < (Math.PI / 4) - (delta * this.angularSpeed))/* so that he can't move backward*/
                this.bodyOrientation += delta * this.angularSpeed;
            this.speed = THREE.Math.clamp(this.speed + dir * delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed);

        }

        if (controls.moveRight) {

            if (this.bodyOrientation > -(Math.PI / 4) + (delta * this.angularSpeed))/* so that he can't move backward*/
                this.bodyOrientation -= delta * this.angularSpeed;
            this.speed = THREE.Math.clamp(this.speed + dir * delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed);

        }

        // speed decay

        if (!(controls.moveForward || controls.moveBackward)) {

            if (this.speed > 0) {

                var k = exponentialEaseOut(this.speed / this.maxSpeed);
                this.speed = THREE.Math.clamp(this.speed - k * delta * this.frontDecceleration, 0, this.maxSpeed);

            } else {

                var k = exponentialEaseOut(this.speed / this.maxReverseSpeed);
                this.speed = THREE.Math.clamp(this.speed + k * delta * this.backAcceleration, this.maxReverseSpeed, 0);

            }

        }

        // displacement

        var forwardDelta = this.speed * delta;

        if ((this.root.position.x + Math.sin(this.bodyOrientation) * forwardDelta) < this.maxX &&
            (this.root.position.x + Math.sin(this.bodyOrientation) * forwardDelta) > -this.maxX)
        {
            this.root.position.x += Math.sin(this.bodyOrientation) * forwardDelta;
        }
        this.root.position.z += Math.cos(this.bodyOrientation) * forwardDelta;

        // steering

        this.root.rotation.y = Math.PI / 2 + this.bodyOrientation;

    };

    function exponentialEaseOut(k) { return k === 1 ? 1 : -Math.pow(2, -10 * k) + 1; }
};
