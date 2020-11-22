
var canv = document.getElementById("canv");
var ctx = canv.getContext("2d");

const DEFAULT_DISTANCE_BETWEEN_MARKERS = 45;
const FONT_SIZE = 10;

var canvHeight = canv.clientHeight;
var canvWidth = canv.clientWidth;

var xZoomFactor = 1;
var yZoomFactor = 1;

var centerX = 0;
var centerY = 0;

var xMarkerPixDistance = 45;
var yMarkerPixDistance = 45;

var xInterval = 1;
var yInterval = 1;

var xRadius = 0;
var yRadius = 0;

var functionsList = [];

function setupProgram(){
    ctx.font = FONT_SIZE + "px Arial";
}

function calibrate(){    
    xInterval = calculateMarkerInterval(xZoomFactor);
    yInterval = calculateMarkerInterval(yZoomFactor);
    xMarkerPixDistance = calculatePixDistanceBetweenMarkers(xZoomFactor,xInterval)
    yMarkerPixDistance = calculatePixDistanceBetweenMarkers(yZoomFactor,yInterval)
    setXRadius();
    setYRadius();
}

function calculateMarkerInterval(zoomFactor){
    return 1/2**Math.floor(Math.log2(zoomFactor));
}

function calculatePixDistanceBetweenMarkers(zoomFactor,interval){
    return zoomFactor*interval*DEFAULT_DISTANCE_BETWEEN_MARKERS;
}

function drawAllFunctions(){
    for(let i = 0; i < functionsList.length; i++){
        drawFunction(functionsList[i]);
    }
}

function drawFunction(func){
    let xStart = centerX - xRadius;
    let xEnd = centerX + xRadius;
    
    let xa = xStart;
    let ya = func(xStart);
    let interval = xRadius*2/(canvWidth/0.05);

    for(let i = xStart + interval; i < xEnd; i+=interval){
        let xb = i;
        let yb = func(i);

        drawLine(xa,ya,xb,yb);

        xa = xb;
        ya = yb;
    }
}

function drawLine(xa,ya,xb,yb){
    ctx.beginPath()
    ctx.moveTo(calculateXtoCanvasLocation(xa),calculateYtoCanvasLocation(ya))
    ctx.lineTo(calculateXtoCanvasLocation(xb),calculateYtoCanvasLocation(yb))
    ctx.stroke()
}

function labelHorizontalValue(x){
    let canvasX = calculateXtoCanvasLocation(x);
    let yAxisCanvLocation = calculateYtoCanvasLocation(0) + (FONT_SIZE + 2);

    if(yAxisCanvLocation > canvHeight - (FONT_SIZE + 2)){
        yAxisCanvLocation = canvHeight - (FONT_SIZE + 2);
    }
    else if(yAxisCanvLocation < FONT_SIZE + 2){
        yAxisCanvLocation = FONT_SIZE + 2;
    }

    ctx.fillText(x,canvasX,yAxisCanvLocation);
}

function labelVerticalValue(y){
    let canvasY = calculateYtoCanvasLocation(y) + FONT_SIZE/2;
    let xAxisCanvLocation = calculateXtoCanvasLocation(0) - (FONT_SIZE + 2);

    if(xAxisCanvLocation > canvWidth - (FONT_SIZE)){
        ctx.textAlign = "end";
        xAxisCanvLocation = canvWidth - (FONT_SIZE);
    }
    else if(xAxisCanvLocation < FONT_SIZE){
        xAxisCanvLocation = FONT_SIZE;
    }

    ctx.fillText(y,xAxisCanvLocation,canvasY);
    ctx.textAlign = "start";
}

function drawAllHelperLines(){
    drawAllHorizontalHelperLines();
    drawAllVerticalHelperLines();
}

function drawAllVerticalHelperLines(){
    let startX = Math.ceil((centerX-xRadius)/xInterval)*xInterval;
    let endX = Math.ceil(((centerX + xRadius)-startX)/xInterval)*xInterval+startX;
    for(let i = startX; i < endX; i += xInterval){
        if(i == 0){
            continue;
        }
        drawVerticalHelperLine(i);
        labelHorizontalValue(i);
    }
}

function drawAllHorizontalHelperLines(){
    let startY = Math.ceil((centerY-yRadius)/yInterval)*yInterval;
    let endY = Math.ceil(((centerY + yRadius)-startY)/yInterval)*yInterval+startY;
    for(let i = -startY; i > -endY; i -= yInterval){
        if(i == 0){
            continue;
        }
        drawHorizontalHelperLine(i);
        labelVerticalValue(i);
    }
}

function drawVerticalHelperLine(x){
    let canvasX = calculateXtoCanvasLocation(x)
    ctx.beginPath()
    ctx.moveTo(canvasX,0)
    ctx.lineTo(canvasX,canvHeight)
    ctx.strokeStyle = '#d1d1d1'
    ctx.stroke()
    ctx.strokeStyle='#000'
}

function drawHorizontalHelperLine(y){
    let canvasY = calculateYtoCanvasLocation(y)
    ctx.beginPath()
    ctx.moveTo(0,canvasY)
    ctx.lineTo(canvWidth,canvasY)
    ctx.strokeStyle = '#d1d1d1'
    ctx.stroke()
    ctx.strokeStyle='#000'
}

function drawAllAxis(){
    drawXAxis();
    drawYAxis();
}

function drawXAxis(){
    let y = calculateYtoCanvasLocation(0);
    if(isYCanvasValueInFocus(y)){        
        ctx.beginPath()
        ctx.moveTo(0,y)
        ctx.lineTo(canvWidth,y)
        ctx.stroke()
    }
}

function drawYAxis(){
    let x = calculateXtoCanvasLocation(0);
    if(isXCanvasValueInFocus(x)){
        ctx.beginPath()
        ctx.moveTo(x,0)
        ctx.lineTo(x,canvHeight)
        ctx.stroke()
    }
}

function isXCanvasValueInFocus(x){
    if(x<0 || x>canvWidth){
        return false;
    }
    return true;
}

function isYCanvasValueInFocus(y){
    if(y<0 || y>canvHeight){
        return false;
    }
    return true;
}

function setXRadius(){
    xRadius = (canvWidth/2)/xMarkerPixDistance*xInterval;
}

function setYRadius(){
    yRadius = (canvHeight/2)/yMarkerPixDistance*yInterval;
}

function calculateXtoCanvasLocation(x){
    let relativeToCenterX = x-centerX;
    let xCanvasLocation = canvWidth/2 + (relativeToCenterX/xInterval) * xMarkerPixDistance;
    return xCanvasLocation
}

function calculateYtoCanvasLocation(y){
    let relativeToCenterY = y+centerY;
    let yCanvasLocation =  canvHeight/2 - (relativeToCenterY/yInterval) * yMarkerPixDistance;
    return yCanvasLocation;
}

function clearField(){
    ctx.clearRect(0,0,canvWidth,canvHeight);
}

function drawField(){
    clearField();
    calibrate();
    drawAllHelperLines();
    drawAllAxis();
    drawAllFunctions();
}

//former function creator

function createArbitraryFunction(grad,...args){
    return function(x){
        let y = 0
        for(let i = grad; i >= 0; i--){
            let factor = 0;
            if(grad-i >= args.length){
                factor = 0
            }
            else{
                factor = args[grad-i]
            }
            y += factor*Math.pow(x,i)
        }
        return y
    }
}



/////////////////////////////////////////
//input function handlers
////////////////////////////////////////




const precedences = {
    '+': 2,
    '-': 2,
    '/': 3,
    '*': 3,
    '^': 4
};

const legalCharacters = new Set([
    '+','-','/','*','^','(',')'
]);

const openParenthesisCharacters = new Set([
    '('
]);

const operatorFunctions = {
    '+': (a,b) => a + b,
    '-': (a,b) => a - b,
    '/': (a,b) => a / b,
    '*': (a,b) => a * b,
    '^': (a,b) => a ** b
};

const operatorArguments = {
    '+': 2,
    '-': 2,
    '/': 2,
    '*': 2,
    '^': 2
};

function createReversePolishNotation(equationParts){
    const equationLength = equationParts.length;
    var output = [];
    var stack = [];

    for(let i = 0; i < equationLength; i++){
        let nextCharacter = equationParts.shift();
        let numberCheck = isCharacterNumber(nextCharacter);
        let variableCheck = isCharacterVariable(nextCharacter);
        if(numberCheck || variableCheck){
            if(numberCheck){
                nextCharacter = Number(nextCharacter);
            }
            output.push(nextCharacter);            
        }
        else if(isCharacterLegal(nextCharacter)){
            if(nextCharacter == ')'){
                popUntilOpeningParenthesis(stack,output);
            }
            else if(isCharacterParenthesis(nextCharacter)){
                stack.push(nextCharacter);
            }
            else if(hasLowerOrEqualPrecedence(nextCharacter,stack)){
                popUntilSameOrLowerPrecendence(nextCharacter,stack,output);
            }
            else{                
                stack.push(nextCharacter);
            }
        }
    }

    emptyStackAtTheEnd(stack,output);

    return output;
}

function isCharacterLegal(char){
    return legalCharacters.has(char);
}

function isCharacterNumber(char){
    return !isNaN(char);
}

function isCharacterVariable(char){
    return char === 'x';
}

function isCharacterParenthesis(char){
    return openParenthesisCharacters.has(char);
}

function popUntilOpeningParenthesis(stack,output){
    var char = stack.pop();
    while(char != '(' && stack.length > 0){
        output.push(char);
        char = stack.pop();
    }
}

function hasLowerOrEqualPrecedence(a,stack){
    if(stack.length == 0){
        return false;
    }
    else if(openParenthesisCharacters.has(stack[stack.length-1])){
        return false;
    }
    else{
        return precedences[a] <= precedences[stack[stack.length-1]];
    }
}

function popUntilSameOrLowerPrecendence(char,stack,output){
    while(stack.length > 0 && (hasLowerOrEqualPrecedence(char,stack) || precedences[char] == precedences[stack[stack.length-1]] )){
        output.push(stack.pop());
    }
    stack.push(char);
}

function emptyStackAtTheEnd(stack,output){
    var stackTotalLength = stack.length;
    for(let i = 0; i < stackTotalLength; i++){
        output.push(stack.pop());
    }
}

function solvePostfixForX(inputPostfixArray,xValue){
    var postfixArray = [...inputPostfixArray];
    while(postfixArray.includes('x')){
        postfixArray.splice(postfixArray.indexOf('x'),1,xValue);
    };
    return solvePostfix(postfixArray);
}

function solvePostfix(inputPostfixArray){
    var postfixArray = [...inputPostfixArray];
    for(let i = 0; i < postfixArray.length; i++){
        var currPart = postfixArray[i];
        if(currPart in operatorFunctions){
            useOperator(postfixArray,currPart,i);
            i -= operatorArguments[currPart];
        }
    }
    if(postfixArray.length > 1){
        return false;
    }
    return postfixArray[0];
}

function useOperator(postfixArray,operator,operatorIndex){
    var operatorArgumentsAmount = operatorArguments[operator];
    var currOperatorArguments = [];

    for(let i = operatorIndex - operatorArgumentsAmount; i < operatorIndex; i++){
        currOperatorArguments.push(postfixArray[i]);        
    }

    var functionResult = operatorFunctions[operator](...currOperatorArguments);
    
    postfixArray.splice(operatorIndex - operatorArgumentsAmount, 3,functionResult);
}

function createFunctionFromPostfixWithX(inputPostfixArray){
    return function(x){
        postfixArray = [...inputPostfixArray];
        return solvePostfixForX(postfixArray,x);
    }
};



////////////////////////////
//controller
////////////////////////////



function changeXRelativeToZoom(change){
    centerX +=change/xZoomFactor;
    drawField();
}

function changeYRelativeToZoom(change){
    centerY +=change/yZoomFactor;
    drawField();
}

function multiplyXZoom(factor){
    xZoomFactor *= factor;
    drawField();
}

function multiplyYZoom(factor){
    yZoomFactor *= factor;
    drawField();
}

function reset(){
    xZoomFactor = 1;
    yZoomFactor = 1;
    centerX = 0;
    centerY = 0;
    drawField();
}

function btnFunctionCreate(){
    let postfix,func;
    let args = $("#finput").val().split(" ");
    console.log(args);  
    $("#finput").val("");    

    postfix = createReversePolishNotation(args);
    func = createFunctionFromPostfixWithX(postfix);
    functionsList.push(func);
    drawField();
}

$.extend({
    el: function(el, props) {
        var $el = $(document.createElement(el));
        $el.attr(props);
        return $el;
    }
});

function addRow(){
    let row = $.el('div', {'class': 'centered'});
    let text = $.el('div', {'class':'test2'});
    text.text("Ayyyyyy")
    let button = $.el('button',{});

    button.text("Pener");

    text.append(button);
    row.append(text);
    $('#functions').append(row);
}

setupProgram();
drawField();
addRow();