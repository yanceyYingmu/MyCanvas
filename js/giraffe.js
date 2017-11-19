
// Fabric.js Canvas object
var canvas;
// current unsaved state
var state;
// past states
var undo = [];
// reverted states
var redo = [];
// 添加的图片索引
var imgIndex = 0;

// 当前选择的元素
var elementCurrentSelected;

var alignTolerance = 5; //pixels to snap
var lines = {
	top: null,
	left: null,
	right: null,
	bottom: null,
	centerH: null,
	centerV: null
};

/**
 * Push the current state into the undo stack and then capture the current state
 */
function save() {
	// clear the redo stack
	redo = [];
	$('#redo').prop('disabled', true);
	// initial call won't have a state
	if (state) {
		undo.push(state);
		$('#undo').prop('disabled', false);
	}
	state = JSON.stringify(canvas);
}

/**
 * Save the current state in the redo stack, reset to a state in the undo stack, and enable the buttons accordingly.
 * Or, do the opposite (redo vs. undo)
 * @param playStack which stack to get the last state from and to then render the canvas as
 * @param saveStack which stack to push current state into
 * @param buttonsOn jQuery selector. Enable these buttons.
 * @param buttonsOff jQuery selector. Disable these buttons.
 */
function replay(playStack, saveStack, buttonsOn, buttonsOff) {
	saveStack.push(state);
	state = playStack.pop();
	var on = $(buttonsOn);
	var off = $(buttonsOff);
	// turn both buttons off for the moment to prevent rapid clicking
	on.prop('disabled', true);
	off.prop('disabled', true);
	canvas.clear();
	canvas.loadFromJSON(state, function () {
		canvas.renderAll();
		// now turn the buttons back on if applicable
		on.prop('disabled', false);
		if (playStack.length) {
			off.prop('disabled', false);
		}
	});
}


// 添加图片
function addImage(imageName) {
	//var coord = getRandomLeftTop();

	fabric.Image.fromURL('image/' + imageName, function (image) {

		image.set({
			top: Math.random() * 250,
			left: Math.random() * 250,
			angle: fabric.util.getRandomInt(-10, 10)
		}).setCoords();

		canvas.add(image);
		canvas.renderAll();
		save();
	});
};
// 添加形状
function addShape() {
	var dim = fabric.util.getRandomInt(30, 60);
	var klass = ['Rect', 'Triangle', 'Circle'][fabric.util.getRandomInt(0, 2)];
	var options = {
		originX: 'center',
		originY: 'center',
		top: Math.random() * 250,
		left: Math.random() * 250,
		fill: '#' + Math.floor(Math.random() * 16777215).toString(16)
	};
	if (klass === 'Circle') {
		options.radius = Math.random() * 250;
	}
	else {
		options.width = dim;
		options.height = dim;
	}

	canvas.add(new fabric[klass](options));
	canvas.renderAll();
	save();
};
// 画对齐线
function drawLine(side, pos) {
	var ln = null
	switch (side) {
		case 'top':
			ln = new fabric.Line([canvas.get('width'), 0, 0, 0], {
				left: 0,
				top: pos,
				strokeDashArray: [5, 5],
				stroke: 'black'
			});
			lines.top = ln;
			break;
		case 'left':
			ln = new fabric.Line([0, canvas.get('height'), 0, 0], {
				left: pos,
				top: 0,
				strokeDashArray: [5, 5],
				stroke: 'black'
			});
			lines.left = ln;
			break;
		case 'right':
			ln = new fabric.Line([0, canvas.get('height'), 0, 0], {
				left: pos,
				top: 0,
				strokeDashArray: [5, 5],
				stroke: 'black'
			});
			lines.right = ln;
			break;
		case 'bottom':
			ln = new fabric.Line([canvas.get('width'), 0, 0, 0], {
				left: 0,
				top: pos,
				strokeDashArray: [5, 5],
				stroke: 'black'
			});
			lines.bottom = ln;
			break;
		case 'centerH':
			ln = new fabric.Line([0, canvas.get('height'), 0, 0], {
				left: pos,
				top: 0,
				strokeDashArray: [5, 5],
				stroke: 'black'
			});
			lines.centerH = ln;
			break;
		case 'centerV':
			ln = new fabric.Line([canvas.get('width'), 0, 0, 0], {
				left: 0,
				top: pos,
				strokeDashArray: [5, 5],
				stroke: 'black'
			});
			lines.centerV = ln;
			break;
	}
	canvas.add(ln).renderAll();
	ln.bringToFront();
};

function inRange(val1, val2) {
	if ((Math.max(val1, val2) - Math.min(val1, val2)) <= alignTolerance) { return true; }
	else { return false; }
};

////////////////////////////////////////////////////////////////////
$(function () {
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Set up the canvas
	canvas = new fabric.Canvas('myCanvas', {
		//backgroundColor: '#fff',
		selectionLineWidth: 2,
		preserveObjectStacking: true,//选中Obiect时当前图形是否置于顶层
		fireRightClick: true//开启右键事件
	});
	//canvas.setWidth(790);
	//canvas.setHeight(500);
	fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';


	canvas.on('mouse:move', function (options) {
		$('#testMouseMoveSpan').text('CanvasX=' + options.e.clientX + ', CanvasY=' + options.e.clientY);
	});

	canvas.on('mouse:down', function (options) {
		if (options.target) {
			$('#tipSpan').text('an object was clicked! ' + options.target.type);
			elementCurrentSelected = options.target;
		}
		else {
			elementCurrentSelected = null;
		}
	});
	// 监控鼠标抬起事件
	canvas.on('mouse:up', function (options) {
		// 删除对齐线
		//Look at the side we matched on. If we did not match, and we have a line, remove the line.
		console.log('delete');
		for (var i in lines) {
			var line = lines[i];
			canvas.remove(line);
			lines[i] = null;
		}

	});
	// 所有按钮的提示信息
	$('.btn-default').mouseover(function(e){
		var btnElement = document.getElementById(e.target.id);
		$('#tipSpan').text(btnElement.name);
	});

	// 置顶按钮
	$('#toTop').click(function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			canvas.bringToFront(activeObject);
		}
		else {
			alert("select a element first!");
		}
	});

	// 置底按钮
	$('#toBottom').click(function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			canvas.sendToBack(activeObject);
		}
		else {
			alert("select a element first!");
		}
	});

	// 上移一层按钮
	$('#toUp').click(function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			canvas.bringForward(activeObject);
		}
		else {
			alert("select a element first!");
		}
	});

	// 下移一层按钮
	$('#toDown').click(function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			canvas.sendBackwards(activeObject);
		}
		else {
			alert("select a element first!");
		}
	});

	// 拷贝对象按钮
	$('#toCopy').click(function () {
		canvas.getActiveObject().clone(function(cloned) {
			cloned.set("top", cloned.top+10);
			cloned.set("left", cloned.left+10);
			canvas.add(cloned);
		  });
	});

	// 删除对象按钮
	$('#toDel').click(function () {
		if (null != elementCurrentSelected) {
			canvas.remove(elementCurrentSelected);
		}
		else {
			alert("select a element first!");
		}
	});

	// 往左旋转按钮
	$('#toTurnLeft').click(function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			var curAngle = activeObject.get('angle');
			activeObject.set('angle', curAngle - 45);
			canvas.renderAll();
		}
		else {
			alert("select a element first!");
		}
	});

	// 往右旋转按钮
	$('#toTurnRight').click(function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			var curAngle = activeObject.get('angle');
			activeObject.set('angle', curAngle + 45);
			canvas.renderAll();
		}
		else {
			alert("select a element first!");
		}
	});

	// Y轴镜像按钮
	$('#toVerFlip').click(function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			var curState = activeObject.get('flipY');
			activeObject.set('flipY', !curState);
			canvas.renderAll();
		}
		else {
			alert("select a element first!");
		}
	});

	// X轴镜像按钮
	$('#toHorFlip').click(function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			var curState = activeObject.get('flipX');
			activeObject.set('flipX', !curState);
			canvas.renderAll();
		}
		else {
			alert("select a element first!");
		}
	});

	// 旋转角度调整		
	var angleControl = document.getElementById('angleControl');
	angleControl.oninput = function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			activeObject.set('angle', parseInt(this.value, 10)).setCoords();
			$('#angleControlValue').text('值:' + this.value + '°');
			canvas.requestRenderAll();
		}

	};
	// 透明度调整		
	var opacityControl = document.getElementById('opacityControl');
	opacityControl.oninput = function () {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			activeObject.set('opacity', parseInt(this.value, 10) / 100);
			$('#opacityControlValue').text('值:' + this.value);
			canvas.requestRenderAll();
		}

	};

	// save initial state
	save();
	// register event listener for user's actions
	canvas.on('object:modified', function () {
		save();
	});

	canvas.on('mouse:over', function (e) {
		//e.target.set('fill', 'red');
		//canvas.renderAll();
	});

	canvas.on('mouse:out', function (e) {
		//e.target.set('fill', 'green');
		//canvas.renderAll();
	});


	// 添加文字1
	$('#addText').click(function () {
		var text = 'Lorem ipsum dolor sit amet,\nconsectetur adipisicing elit,\nsed do eiusmod tempor incididunt\nut labore et dolore magna aliqua.\n' +
			'Ut enim ad minim veniam,\nquis nostrud exercitation ullamco\nlaboris nisi ut aliquip ex ea commodo consequat.';

		var textSample = new fabric.Text(text.slice(0, fabric.util.getRandomInt(0, text.length)), {
			left: Math.random() * 250,
			top: Math.random() * 250,
			fontFamily: 'helvetica',
			//angle: getRandomInt(-10, 10),
			fill: '#' + Math.floor(Math.random() * 16777215).toString(16),
			scaleX: 0.5,
			scaleY: 0.5,
			fontWeight: '',
			originX: 'left',
			hasRotatingPoint: true,
			centerTransform: true
		});
		canvas.add(textSample);
		canvas.renderAll();
		save();
	});

	// 添加文字2
	$('#addIText').click(function () {
		var text = 'Lorem ipsum dolor sit amet,\nconsectetur adipisicing elit,\nsed do eiusmod tempor incididunt\nut labore et dolore magna aliqua.\n' +
			'Ut enim ad minim veniam,\nquis nostrud exercitation ullamco\nlaboris nisi ut aliquip ex ea commodo consequat.';

		var textSample = new fabric.IText(text.slice(0, fabric.util.getRandomInt(30, text.length)), {
			left: Math.random() * 250,
			top: Math.random() * 250,
			fontFamily: 'helvetica',
			//angle: getRandomInt(-10, 10),
			fill: '#' + Math.floor(Math.random() * 16777215).toString(16),
			scaleX: 0.5,
			scaleY: 0.5,
			fontWeight: '',
			originX: 'left',
			hasRotatingPoint: true,
			centerTransform: true
		});
		canvas.add(textSample);
		canvas.renderAll();
		save();
	});

	// 添加文字3 
	$('#addTextbox').click(function () {
		var text = 'Lorem ipsum dolor sit amet,\nconsectetur adipisicing elit,\nsed do eiusmod tempor incididunt\nut labore et dolore magna aliqua.\n' +
			'Ut enim ad minim veniam,\nquis nostrud exercitation ullamco\nlaboris nisi ut aliquip ex ea commodo consequat.';

		var textSample = new fabric.Textbox(text.slice(0, fabric.util.getRandomInt(30, text.length)), {
			fontSize: 20,
			left: Math.random() * 250,
			top: Math.random() * 250,
			fontFamily: 'helvetica',
			//angle: getRandomInt(-10, 10),
			fill: '#' + Math.floor(Math.random() * 16777215).toString(16),
			scaleX: 0.5,
			scaleY: 0.5,
			fontWeight: '',
			originX: 'left',
			width: 300,
			hasRotatingPoint: true,
			centerTransform: true
		});
		canvas.add(textSample);
		canvas.renderAll();
		save();
	});

	// 添加图片1
	$('#addImage').click(function () {
		addImage('temp-1.jpg');
	});


	// 添加形状
	$('.addShape0').on({
		click: function (e) {
			console.log(e.target.id + 'clicked;');
			addShape();
		},
		mouseenter: function () {
			$(this).addClass("ShapeInside");
		},
		mouseleave: function () {
			$(this).removeClass("ShapeInside");
		}
	});
	
	//加粗		  

          $('#tofontBold').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
				  var curState = activeObject.get('fontWeight');
				  if(curState == 'bold')
				  {
					 curState = 'normal'; 
				  }
				  else {
					  curState = 'bold'; 
				  }
			  	activeObject.set('fontWeight', curState);
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });	
			
		  //倾斜		  

          $('#tofontItalic').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
				  var curState = activeObject.get('fontStyle');
				  if(curState == 'italic')
				  {
					 curState = 'normal'; 
				  }
				  else {
					  curState = 'italic'; 
				  }
			  	activeObject.set('fontStyle', curState);
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });

          //下划线		  

          $('#toTextDecoration').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
				  
				  var curState = activeObject.get('underline');
				  if(curState == 'underline')
				  {
					 curState = ''; 
				  }
				  else {
					  curState = 'underline'; 
				  }
				  
			  	//activeObject.set('textDecoration', 'underline');
				activeObject.set('underline', curState);
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
			  /*
			  var value = $scope.isUnderline()? getActiveStyle('textDecoration').replace('underline', '')
			  : (getActiveStyle('textDecoration') + ' underline');

			setActiveStyle('textDecoration', value);
			setActiveStyle('underline', !getActiveStyle('underline'));
			*/

		  });		  
		  
		  //左对齐		  

          $('#toTextAlignLeft').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('textAlign', 'left');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });	
		  
		  //居中		  

          $('#toTextAlignCenter').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('textAlign', 'center');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });	
		  
		  	
		  
		  //右对齐		  

          $('#toTextAlignRight').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('textAlign', 'right');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });	
		  
		  //垂直左对齐		  

          $('#toVerticalAlignLeft').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('textBaseline', 'top');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });	
		  
		  //垂直居中对齐		  		  

          $('#toVerticalAlignCenter').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('textBaseline', 'middle');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });		
		  
		  //垂直右对齐		  	  

          $('#toVerticalAlignRight').click(function(){
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('textBaseline', 'bottom');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });	
		  
		   //字体样式一
		   $('#textFont1').click(function(){
			   alert("click");
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('fontFamily', 'arial');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });
		  
		  //字体样式二
		   $('#textFont2').click(function(){
			   alert("click");
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('fontFamily', 'helvetica');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });
		  
		  //字体样式三
		   $('#textFont3').click(function(){
			   alert("click");
			  var activeObject = canvas.getActiveObject();
			  if (activeObject){
			  	activeObject.set('fontFamily', 'myriad pro');
				canvas.renderAll();
			  }
			  else{
				  alert("select a element first!");
			  }
		  });
		  
		  
		   
	
	

	// 绑定动态加入div的单击事件
	$('body').on('click', '#localImageListLeft .ResourceImage-item', function (e) {
		console.log(e.target.id);
		var imgElement = document.getElementById(e.target.id);
		var Image = new fabric.Image(imgElement);
		Image.set({
			top: Math.random() * 790,
			left: Math.random() * 500
		}).setCoords();
		canvas.add(Image);
		canvas.renderAll();
		save();

	});
	$('body').on('mouseenter', '#localImageListLeft .ResourceImage-item', function () {
		console.log('in');
		$(this).addClass("ImageInside");
	});
	$('body').on('mouseleave', '#localImageListLeft .ResourceImage-item', function () {
		$(this).removeClass("ImageInside");
	});


	// 添加本地图片
	var fileInput = document.getElementById('addLocalImageFile'); //
	var imagesListLeft = $('#localImageListLeft'); // 左边那列瀑布流
	var imagesListRight = $('#localImageListRight'); // 右边那列瀑布流
	// 监听change事件:
	fileInput.addEventListener('change', function () {
		// 检查文件是否选择:
		if (!fileInput.value) {
			$('#tipSpan').text('没有选择文件');
			return;
		}
		// 获取File引用:
		var file = fileInput.files[0];
		// 获取File信息:
		$('#tipSpan').text('文件: ' + file.name + '<br>' +
			'大小: ' + file.size + '<br>' +
			'修改: ' + file.lastModifiedDate);
		if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
			alert('不是有效的图片文件!');
			return;
		}
		// 读取文件:
		var reader = new FileReader();
		reader.onload = function (e) {
			var
				data = e.target.result; // 'data:image/jpeg;base64,/9j/4AAQSk...(base64编码)...' 
				imagesListLeft.append('<div class="ResourceImage-item"><img id="img_list_left_select_' + imgIndex + '" src="' + data + '"></div>');
			imgIndex = imgIndex + 1;
			//preview.style.backgroundImage = 'url(' + data + ')';
		};
		// 以DataURL的形式读取文件:
		reader.readAsDataURL(file);
	});


	// 添加一个新的画布
	$('#addNewCanvas').click(function () {
		alert('add a new canvas');
		var canvas = document.createElement('canvas');
		canvas.id = 'newCanvas';
		canvas.width = 790;
		canvas.height = 200;
		canvas.style.border = '1px solid';
		canvas.border = '#f00';

		$('div .canvas-bd').append(canvas);
	});
	// 撤销和重做
	$('#undo').click(function () {
		replay(undo, redo, '#redo', this);
	});
	$('#redo').click(function () {
		replay(redo, undo, '#undo', this);
	});




	//更新控件的值
	function updateControls() {
		var activeObject = canvas.getActiveObject();
		if (activeObject) {
			//console.log(activeObject.angle);
			//scaleControl.value = rect.scaleX;
			angleControl.value = activeObject.angle;
			opacityControl.value = activeObject.opacity * 100;
			//topControl.value = rect.top;
			//skewXControl.value = activeObject.skewX;
			//skewYControl.value = activeObject.skewY;
		}
	}
	canvas.on({
		//'object:moving': updateControls,
		'object:scaling': updateControls,
		'object:resizing': updateControls,
		'object:rotating': updateControls,
		'object:skewing': updateControls
	});

	// 监控元素移动事件
	canvas.on('object:moving', function (e) {
		var obj = e.target;
		//Set up an object representing its current position
		obj.setCoords();

		var objBound = obj.getBoundingRect();
		var curPos = {
			top: parseInt(objBound.top),
			left: parseInt(objBound.left),
			right: parseInt(objBound.left + objBound.width),
			bottom: parseInt(objBound.top + objBound.height),
			centerH: parseInt(objBound.left + objBound.width / 2),
			centerV: parseInt(objBound.top + objBound.height / 2)
		};
		var deltaPos = {
			top: parseInt(objBound.top - obj.get('top')),
			left: parseInt(objBound.left - obj.get('left')),
			right: parseInt(curPos.right - (obj.get('left') + obj.get('width'))),
			bottom: parseInt(curPos.bottom - (obj.get('top') + obj.get('height'))),
			centerH: parseInt(curPos.centerH - (obj.get('left') + obj.get('width') / 2)),
			centerV: parseInt(curPos.centerV - (obj.get('top') + obj.get('height') / 2))
		};
		//Set up an object that will let us be able to keep track of newly created lines
		var matches = {
			top: false,
			left: false,
			right: false,
			bottom: false,
			centerH: false,
			centerV: false
		};
		// 遍历画布上的每一个元素
		canvas.forEachObject(function (targ) {
			if (targ === obj) {
				console.log('myself.');
				return;
			};

			if (targ.get('type') === 'line') {
				console.log('lines.');
				return;
			};
			//Set up an object representing the position of the canvas object
			var bound = targ.getBoundingRect();
			var objPos = {
				top: parseInt(bound.top),
				left: parseInt(bound.left),
				right: parseInt(bound.left + bound.width),
				bottom: parseInt(bound.top + bound.height),
				centerH: parseInt(bound.left + bound.width / 2),
				centerV: parseInt(bound.top + bound.height / 2)
			};
			//Look at all 4 sides of the object and see if the object being manipulated aligns with that side.
			//Top////////////////////////////////////
			if (inRange(objPos.top, curPos.top)) {
				//We match. If we don't already have aline on that side, add one.
				if (!lines.top) {
					drawLine('top', objPos.top);
					//Keep track of the fact we found a match so we don't remove the line prematurely.
					matches.top = true;
					//Snap the object to the line
					obj.set('top', objPos.top - deltaPos.top).setCoords();
					console.log('snap top');
				}
			};
			if (inRange(objPos.top, curPos.bottom)) {
				if (!lines.top) {
					drawLine('top', objPos.top);
					//Keep track of the fact we found a match so we don't remove the line prematurely.
					matches.top = true;
					//Snap the object to the line
					obj.set('top', objPos.top - objBound.height - deltaPos.top).setCoords();
					console.log('snap top');
				}
			}

			//Left////////////////////////////////////
			if (inRange(objPos.left, curPos.left)) {
				if (!lines.left) {
					drawLine('left', objPos.left);
					matches.left = true;
					obj.set('left', objPos.left - deltaPos.left).setCoords();
					console.log('snap left');
				}
			};
			if (inRange(objPos.left, curPos.right)) {
				if (!lines.left) {
					drawLine('left', objPos.left);
					matches.left = true;
					obj.set('left', objPos.left - objBound.width - deltaPos.left).setCoords();
					console.log('snap left');
				}
			};

			//Right////////////////////////////////////
			if (inRange(objPos.right, curPos.right)) {
				if (!lines.right) {
					drawLine('right', objPos.right);
					matches.right = true;
					obj.set('left', objPos.right - obj.get('width') - deltaPos.right).setCoords();
					console.log('snap right');
				}
			};
			if (inRange(objPos.right, curPos.left)) {
				if (!lines.right) {
					drawLine('right', objPos.right);
					matches.right = true;
					obj.set('left', objPos.right - deltaPos.left).setCoords();
					console.log('snap right');
				}
			};
			//Bottom////////////////////////////////////
			if (inRange(objPos.bottom, curPos.bottom)) {
				if (!lines.bottom) {
					drawLine('bottom', objPos.bottom);
					matches.bottom = true;
					obj.set('top', objPos.bottom - obj.get('height') - deltaPos.bottom).setCoords();
					console.log('snap bottom');
				}
			};
			if (inRange(objPos.bottom, curPos.top)) {
				if (!lines.bottom) {
					drawLine('bottom', objPos.bottom);
					matches.bottom = true;
					obj.set('top', objPos.bottom - deltaPos.top).setCoords();
					console.log('snap bottom');
				}
			};
			//Center////////////////////////////////////
			if (inRange(objPos.centerH, curPos.centerH)) {
				if (!lines.centerH) {
					drawLine('centerH', objPos.centerH);
					matches.centerH = true;
					obj.set('left', objPos.centerH - deltaPos.centerH - obj.get('width') / 2).setCoords();
					console.log('snap centerH');
				}
			};
			if (inRange(objPos.centerV, curPos.centerV)) {
				if (!lines.centerV) {
					drawLine('centerV', objPos.centerV);
					matches.centerV = true;
					obj.set('top', objPos.centerV - deltaPos.centerV - obj.get('height') / 2).setCoords();
					console.log('snap centerV');
				}
			};
			// 删除对齐线
			//Look at the side we matched on. If we did not match, and we have a line, remove the line.
			for (var i in matches) {
				var m = matches[i];
				var line = lines[i];
				if (!m && line) {
					canvas.remove(line);
					lines[i] = null;
				}

			}

		});
		canvas.renderAll();

	});


});

