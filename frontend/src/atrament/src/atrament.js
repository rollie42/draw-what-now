const { Mouse, Point } = require('./mouse.js');
const Constants = require('./constants.js');
const { AtramentEventTarget } = require('./events.js');
const { ShapeCanvas } = require('./workingCanvas.js')
const Pixels = require('./pixels.js');

const DrawingMode = {
  DRAW: 'draw',
  DRAW_SQUARE: 'draw-square',
  DRAW_CIRCLE: 'draw-circle',
  DRAW_TRIANGLE: 'draw-triangle',
  DRAW_LINE: 'draw-line',
  ERASE: 'erase',
  FILL: 'fill',
  DISABLED: 'disabled'
};

exports.DrawingMode = DrawingMode;
exports.Atrament = class Atrament extends AtramentEventTarget {
  constructor(selector, config = {}) {
    if (typeof window === 'undefined') {
      throw new Error('Looks like we\'re not running in a browser');
    }

    console.log('constructing...?')

    super();

    // get canvas element
    if (selector instanceof window.Node && selector.tagName === 'CANVAS') this.canvas = selector;
    else if (typeof selector === 'string') this.canvas = document.querySelector(selector);
    else throw new Error(`can't look for canvas based on '${selector}'`);
    if (!this.canvas) throw new Error('canvas not found');

    // set external canvas params
    this.canvas.width = config.width || this.canvas.width;
    this.canvas.height = config.height || this.canvas.height;

    // set internal canvas params
    this.context = this.canvas.getContext('2d');
    this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = 1;
    //this.context.lineCap = 'round';
    //this.context.lineJoin = 'round';
    this.context.translate(0.5, 0.5);

    // copy canvas for various drawing operations
    const shapeCanvas = this.canvas.cloneNode();
    shapeCanvas.id = '_draw_canvas_';
    shapeCanvas.style.position = 'absolute';
    shapeCanvas.style.top = 0;
    shapeCanvas.style.left = 0;
    this.canvas.parentNode.appendChild(shapeCanvas);
    this._shapeCanvas = new ShapeCanvas(this, shapeCanvas);

    this.smoothing = Constants.initialSmoothingFactor;
    this._thickness = Constants.initialThickness;
    this._targetThickness = this._thickness;
    this._weight = this._thickness;
    this._maxWeight = this._thickness + Constants.weightSpread;

    this._mode = DrawingMode.DRAW;
    this._fillShape = true;
    this.adaptiveStroke = false;

    // update from config object
    ['weight', 'smoothing', 'adaptiveStroke', 'mode']
      .forEach(key => config[key] === undefined ? 0 : this[key] = config[key]);
  }

  get color() {
    return Pixels.hexToRgb(this.context.strokeStyle).replace(' ', '')
  }

  set color(c) {
    if (typeof c !== 'string') throw new Error('wrong argument type');
    this.context.strokeStyle = c;
    this.context.fillStyle = c;
    this._shapeCanvas.context.strokeStyle = c;
    this._shapeCanvas.context.fillStyle = c;
  }

  get weight() {
    return this._weight;
  }

  set weight(w) {
    w = Number(w);
    this._weight = w;
    this._thickness = w;
    this._targetThickness = w;
    this._maxWeight = w + Constants.weightSpread;
    this.context.lineWidth = w;
    this._shapeCanvas.context.lineWidth = w;
  }

  get mode() {
    return this._mode;
  }

  set mode(m) {
    if (typeof m !== 'string') throw new Error('wrong argument type');
    this._mode = m;

    switch (m) {
      case DrawingMode.ERASE:
        this.context.globalCompositeOperation = 'destination-out'
        this._shapeCanvas.context.globalCompositeOperation = 'destination-out'
        break;
      case DrawingMode.FILL:
        this.context.globalCompositeOperation = 'source-over';
        this._shapeCanvas.context.globalCompositeOperation = 'source-over'
        break;
      case DrawingMode.DISABLED:
        break;
      default:
        this.context.globalCompositeOperation = 'source-over';
        this._shapeCanvas.context.globalCompositeOperation = 'source-over'
        break;
    }
  }

  get fillShape() {
    return this._fillShape;
  }

  set fillShape(fill) {
    this._fillShape = fill;
  }

  isDirty() {
    return !!this._dirty;
  }

  fireDirty() {
    this.dispatchEvent('dirty');
  }

  clear() {
    if (!this.isDirty) {
      return;
    }

    this._dirty = false;
    this.dispatchEvent('clean');

    // make sure we're in the right compositing mode, and erase everything
    if (this.mode === DrawingMode.ERASE) {
      this.mode = DrawingMode.DRAW;
      this.context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
      this.mode = DrawingMode.ERASE;
    }
    else {
      this.context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
    }
  }

  toImage() {
    return this.canvas.toDataURL().split(';base64,')[1];
  }
};
