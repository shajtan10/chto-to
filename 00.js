var canvas = document.getElementById('ctx');
var ctx = canvas.getContext('2d');

var worldWidth = worldHeight = 800;

function Rectangle(left, top, width, height){
	this.left = left || 0;
	this.top = top || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
}

Rectangle.prototype.set = function(left, top, /*optional*/ width, /*optional*/ height) {
	this.left = left;
	this.top = top;
	this.width = width || this.width;
	this.height = height || this.height
	this.right = (this.left + this.width);
	this.bottom = (this.top + this.height);
}

Rectangle.prototype.within = function(r) {
	return (r.left <= this.left &&
	r.right >= this.right &&
	r.top <= this.top &&
	r.bottom >= this.bottom);
}

function Camera(x, y, width, height){
	this.x = x || 0;
	this.y = y || 0;
	this.width = width;
	this.height = height;

	this.x_dead_zone = 0;
    this.y_dead_zone = 0;

    this.followed = null;

    this.viewportRect = new Rectangle(this.x, this.y, this.width, this.height);
    this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight);
}

Camera.prototype.follow = function(game_object, x_dead_zone, y_dead_zone){
	this.x_dead_zone = x_dead_zone;
    this.y_dead_zone = y_dead_zone;
    this.followed = game_object;
}

Camera.prototype.update = function(){
	if(this.followed.x - this.x + this.x_dead_zone > this.width)
		this.x = this.followed.x - (this.width - this.x_dead_zone)
	else if(this.followed.x - this.x_dead_zone < this.x)
		this.x = this.followed.x - this.x_dead_zone;

	if(this.followed.y - this.y + this.y_dead_zone > this.height)
		this.y = this.followed.y - (this.height - this.y_dead_zone)
	if(this.followed.y - this.y_dead_zone < this.y)
		this.y = this.followed.y - this.y_dead_zone;

	this.viewportRect.set(this.x, this.y);

	if(!this.viewportRect.within(this.worldRect)){
		if(this.viewportRect.left < this.worldRect.left)
			this.x = this.worldRect.left;
		if(this.viewportRect.top < this.worldRect.top)
			this.y = this.worldRect.top;
		if(this.viewportRect.right > this.worldRect.right)
			this.x = this.worldRect.right - this.width;
		if(this.viewportRect.bottom > this.worldRect.bottom)
			this.y = this.worldRect.bottom - this.height;
	}
}

function in_viewport(x, y, margin) {
    if(
        x >= camera.x - margin &&
        x <= camera.x + camera.width + margin &&
        y >= camera.y - margin &&
        y <= camera.y + camera.height + margin
    ){
       return true;
    }

    return false;
}

function Player(x, y, username){
	this.x = x;
	this.y = y;

	this.width = 11;
	this.height = 17;

	this.left = false;
	this.up = false;
	this.right = false;
	this.down = false;

	this.username = username;
}

Player.prototype.update = function(){
	var newX = this.x;
	var newY = this.y;

	if(this.left)
		newX-=2;
	if(this.up)
		newY-=2;
	if(this.right)
		newX+=2;
	if(this.down)
		newY+=2;

	if(newX - this.width / 2 < 0)
		newX = this.width / 2;
	if(newY - this.height / 2 < 0)
		newY = this.height / 2;
	if(newX + this.width / 2 > worldWidth)
		newX = worldWidth - this.width / 2;
	if(newY + this.height / 2 > worldHeight)
		newY = worldHeight - this.height / 2;

	this.x = newX;
	this.y = newY;
}

Player.prototype.draw = function(xView, yView){
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(
		(this.x - this.width / 2)-xView,
		(this.y - this.height / 2)-yView,
		this.width,
		this.height
	);

	ctx.font = '11px serif';
	ctx.fillText(
		this.username, 
		(this.x - ctx.measureText(this.username).width/2)-xView,
		(this.y - this.height / 2)-yView-5
	)

	ctx.restore();
}

function Entity(x, y, width, height){
	this.x = x;
	this.y = y;

	this.width = width;
	this.height = height;
}

Entity.prototype.draw = function(ctx){
	ctx.save();
	ctx.fillStyle = 'green';
	ctx.fillRect(
		this.x - this.width / 2,
		this.y - this.height / 2,
		this.width, this.height
	)
	ctx.restore();
}

function Map(){
	this.image = null;
}

var entity_on_map = [
	new Entity(100, 200, 15, 20),
	new Entity(510, 250, 15, 20),
	new Entity(300, 600, 15, 20)
]

Map.prototype.generate = function(){
	var ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = worldWidth;
    ctx.canvas.height = worldHeight;

	entity_on_map.forEach(function(e){
		e.draw(ctx);
	})

	this.image = new Image();
    this.image.src = ctx.canvas.toDataURL("image/png");
    
    ctx = null;
}

Map.prototype.draw = function(xView, yView){
	var sx, sy, dx, dy;
    var sWidth, sHeight, dWidth, dHeight;

	sx = xView;
    sy = yView;

    sWidth = ctx.canvas.width;
    sHeight = ctx.canvas.height;

	if(this.image.width - sx < sWidth){
		sWidth = this.image.width - sx;
	}
	if(this.image.height - sy < sHeight){
		sHeight = this.image.height - sy;
	}

	dx = 0;
    dy = 0;
    dWidth = sWidth;
    dHeight = sHeight;

    ctx.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

function update(){
	player.update();
	camera.update();
}

function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	map.draw(camera.x, camera.y);

    player.draw(camera.x, camera.y);
}

var map = new Map();
var player = new Player(220, 230);

var camera = new Camera(0, 0, canvas.width, canvas.height);
camera.follow(player, canvas.width/2, canvas.height/2);

function init(){
	map.generate();
	setInterval(function(){
		update();
		draw();
	},40)
}

init();

window.addEventListener('keydown', function(e) {
	switch(e.keyCode){
		case 37:
			player.left = true;
		break;
		case 38:
			player.up = true;
		break;
		case 39:
			player.right = true;
		break;
		case 40:
			player.down = true;
		break;
	}
}, false);

window.addEventListener('keyup', function(e) {
	switch(e.keyCode){
		case 37:
			player.left = false;
		break;
		case 38:
			player.up = false;
		break;
		case 39:
			player.right = false;
		break;
		case 40:
			player.down = false;
		break;
	}
}, false);

function i2xy(index, mapWidth){
	return [index%mapWidth, Math.floor(index/mapWidth)]
}

function is_colliding(r1, r2)
{
	return (r1.x < (r2.x + r2.w) && (r1.x + r1.w) > r2.x &&
		r1.y < (r2.y + r2.h) && (r1.y + r1.h) > r2.y);
}