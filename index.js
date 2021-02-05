var c, w, h, m, p = {},
    {
        min,
        floor,
        PI,
        cos,
        sin,
        pow,
        random,
        round,
        ceil
    } = Math,
    T_PI = PI * 2


var BOT_SPEED = 1

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {
            tl: radius,
            tr: radius,
            br: radius,
            bl: radius
        };
    } else {
        var defaultRadius = {
            tl: 0,
            tr: 0,
            br: 0,
            bl: 0
        };
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }

}

function Game() {
    this.canvas = document.getElementById('canvas')
    this.ctx = c = this.canvas.getContext('2d')

    this.dimension = 3;

    let focus;
    Object.defineProperty(this, 'focus', {
        get() {
            return focus
        },
        set(v) {
            if (typeof v != 'number' || v < 0 || v > this.values.length || v === focus) return false

            focus = v

            this.draw()
        }
    })

    let foc_btn = 0
    Object.defineProperty(this, 'foc_btn', {
        get() {
            return foc_btn
        },
        set(v) {
            foc_btn = v
            this.draw()
        }
    })
    
    new Ads(document.getElementById('ad-container'), document.getElementById('video-element'), function () {
        this.resize()
        this.restart()
    }.bind(this))
}

p.draw = function () {
    c.clearRect(0, 0, w, h)

    switch (this.game_state) {
        case 0:
            this.drawDesk()
            break;
        default:
            this.drawUI()
            break;
    }

    this.drawText()
}

p.drawText = function () {
    c.save()

    c.font = "48px serif";
    c.textAlign = 'center'
    c.fillText(this.text, w / 2, 50);

    c.restore()
}

p.drawDesk = function () {
    this.drawBounds()
    this.drawValues()
}

p.drawBounds = function () {
    let
        step = this.soket_size,
        s_h = step / 2,
        ctx = this

    let drawSocet = function (pos, color, width, blureColor) {
        c.save()
        if (color)
            c.strokeStyle = color
        if (blureColor) {
            c.shadowColor = blureColor;
            c.shadowBlur = width;
        }
        c.lineWidth = width
        c.beginPath()
        c.moveTo(pos.x - s_h, pos.y - s_h)
        c.lineTo(pos.x + s_h, pos.y - s_h)
        c.lineTo(pos.x + s_h, pos.y + s_h)
        c.lineTo(pos.x - s_h, pos.y + s_h)
        c.closePath()
        c.stroke()
        c.restore()
    }

    let focus_draw
    for (let i = 0; i < this.values.length; i++) {
        if (i === this.focus) {
            focus_draw = function () {
                drawSocet(ctx.getPosByIndex(i), '#f7fff5', ctx.border_width * 1.2)
            }
            continue;
        } else
            drawSocet(this.getPosByIndex(i), '#7b02cc', this.border_width, '#D955FE')

    }
    focus_draw && focus_draw()

}

p.drawValues = function () {
    let step = this.soket_size,
        pos,
        r = step / 2.5

    let draw_O = function (color) {
        c.save()

        c.strokeStyle = color
        c.beginPath()
        c.lineWidth = step * .05
        c.shadowColor = color;
        c.shadowBlur = c.lineWidth * .5;
        c.arc(pos.x, pos.y, r, 0, T_PI * 2)
        c.stroke()

        c.restore()
    }

    let draw_X = function (color) {
        c.save()

        c.strokeStyle = color
        c.beginPath()
        c.lineWidth = step * .05
        c.shadowColor = color;
        c.shadowBlur = c.lineWidth * .5;
        c.moveTo(pos.x + cos(PI / 4) * r, pos.y - sin(PI / 4) * r)
        c.lineTo(pos.x - cos(PI / 4) * r, pos.y + sin(PI / 4) * r)
        c.moveTo(pos.x - cos(PI / 4) * r, pos.y - sin(PI / 4) * r)
        c.lineTo(pos.x + cos(PI / 4) * r, pos.y + sin(PI / 4) * r)
        c.stroke()

        c.restore()

        return true
    }


    this.values.forEach((e, i) => {
        pos = this.getPosByIndex(i);
        if (e === 'x') draw_X(this.player_index === 'x' ? '#00ff11' : '#ff0000')
        else draw_O(this.player_index === 'o' ? '#00ff11' : '#ff0000')
    });
}

p.getPosByIndex = function (i) {
    let g_s = this.desk_size - this.border_width

    return {
        x: this.margin[0] + this.border_width / 2 + g_s * (i % this.dimension + .5) / this.dimension,
        y: this.margin[1] + this.border_width / 2 + g_s * (floor(i / this.dimension) + .5) / this.dimension
    }
}

p.setPlayListeners = function () {
    this.text = 'Your move'

    let cb = function (e) {
        let f_v,
            col = floor(this.focus / this.dimension);
        switch (e.keyCode) {
            case 37:
                f_v = this.focus - 1
                this.focus = floor(f_v / this.dimension) != col ? col * this.dimension + this.dimension - 1 : f_v
                break;

            case 38:
                f_v = this.focus - this.dimension
                this.focus = f_v < 0 ? this.values.length - (this.dimension - this.focus % this.dimension) : f_v
                break;

            case 39:
                f_v = this.focus + 1
                this.focus = floor(f_v / this.dimension) != col ? col * this.dimension : f_v
                break;

            case 40:
                f_v = this.focus + this.dimension
                this.focus = f_v > this.values.length - 1 ? this.focus % this.dimension : f_v
                break;

            case 13:
                if (this.values[this.focus]) return false
                this.setValue(this.focus, this.player_index, function () {
                    this.botPlay()
                }.bind(this))
                this.removeListeners()
                break;
        }
    }.bind(this)
    window.addEventListener('keyup', cb)

    this.removeListeners = function () {
        window.removeEventListener('keyup', cb)
    }
}

p.botPlay = function () {
    let text_arr = ['😱', '🤯', '🤯']
    this.text = text_arr[ceil(text_arr.length * random()) - 1]

    let cache_focus = this.focus
    this.focus = NaN


    let i, state;
    (state = this.findRange([this.bot_win_pattern.slice(0, this.dimension - 1)])) ||
    (state = this.findRange([this.player_win_pattern.slice(0, this.dimension - 1)])) ||
    (state = this.findRange([this.bot_win_pattern.slice(0, this.dimension - 2)])) ||
    (state = {
        range: (function (ctx) {
            let arr = []
            for (let i = 0; i < ctx.values.length; i++) {
                arr.push(i)
            }
            return arr
        }(this))
    })

    for (i = 0; i < state.range.length; i++) {
        if (this.values[state.range[i]]) continue
        i = state.range[i]
        break;
    }


    setTimeout(function () {
        this.setValue(i, this.bot_index, function () {
            this.setPlayListeners()
            this.focus = isNaN(cache_focus) ? 4 : cache_focus
        }.bind(this))
    }.bind(this), BOT_SPEED * 1000)

}

p.setValue = function (i, value, cb) {
    this.values[i] = value

    let w_s = this.findRange([this.bot_win_pattern, this.player_win_pattern])

    if (!w_s && this.values.reduce(function (s, c) {
            return ++s
        }, 0) != this.values.length)
        cb && cb()
    else {
        c.save()

        if (w_s) {
            if (w_s.math_pattern.slice(0, 1) === this.bot_index) {
                this.text = 'Bot is win!'
                c.strokeStyle = '#ff0000'
            } else {
                this.text = 'You are win!'
                c.strokeStyle = '#00ff11'
            }
        } else {
            this.text = 'Dead heat!'
        }


        this.focus = NaN

        setTimeout(function () {
            this.text = ''
            this.game_state = 1
            this.setUIListeners()
            this.draw()
        }.bind(this), 3000)

        if (!w_s.range) return false

        let f_pos = this.getPosByIndex(w_s.range[0]),
            s_pos = this.getPosByIndex(w_s.range[w_s.range.length - 1]),
            r = this.soket_size * .48

        c.beginPath()
        c.lineWidth = this.soket_size * .1
        c.moveTo(f_pos.x + cos(w_s.angle) * r, f_pos.y - sin(w_s.angle) * r)
        c.lineTo(s_pos.x + cos(w_s.angle + PI) * r, s_pos.y - sin(w_s.angle + PI) * r)
        c.stroke()
        c.restore()
    }

}

p.findRange = function (patterns) {
    let
        v_sum,
        h_sum,
        d_f_sum = '',
        d_s_sum = '',
        v_range,
        h_range,
        d_f_range = [],
        d_s_range = [],
        math_pattern

    function matchCheck(val) {
        for (let i = 0; i < patterns.length; i++) {
            if (val != patterns[i]) continue

            math_pattern = patterns[i]
            return true
        }
    }

    for (let r = 0; r < this.dimension; r++) {
        v_sum = h_sum = '';
        v_range = [];
        h_range = [];

        for (let c = 0; c < this.dimension; c++) {

            h_range.push(this.dimension * r + c)
            h_sum += this.values[h_range[h_range.length - 1]] || ''

            v_range[v_range.length] = c * this.dimension + r
            v_sum += this.values[v_range[v_range.length - 1]] || ''
        }


        if (matchCheck(v_sum)) {

            return {
                range: v_range,
                angle: PI / 2,
                math_pattern
            }

        } else if (matchCheck(h_sum)) {

            return {
                range: h_range,
                angle: PI,
                math_pattern
            }

        } else {

            d_f_range[d_f_range.length] = this.dimension * r + r
            d_f_sum += this.values[d_f_range[d_f_range.length - 1]] || '';

            d_s_range[d_s_range.length] = this.dimension * r + (this.dimension - 1) - r
            d_s_sum += this.values[d_s_range[d_s_range.length - 1]] || '';

            if (r === this.dimension - 1) {

                if (matchCheck(d_f_sum)) {

                    return {
                        range: d_f_range,
                        angle: PI / 2 + PI / 4,
                        math_pattern
                    }

                } else if (matchCheck(d_s_sum)) {

                    return {
                        range: d_s_range,
                        angle: PI / 4,
                        math_pattern
                    }

                }

            }
        }

    }

    return false
}

p.drawUI = function () {
    c.save()

    c.fillStyle = '#ffffff';
    if (this.foc_btn) {
        let p = this.f_btn.width * .05;
        roundRect(c, this.f_btn.x - p / 2, this.f_btn.y - p / 2, this.f_btn.width + p, this.f_btn.height + p, this.f_btn.r, true)
    } else {
        let p = this.s_btn.width * .05;
        roundRect(c, this.s_btn.x - p / 2, this.s_btn.y - p / 2, this.s_btn.width + p, this.s_btn.height + p, this.s_btn.r, true)
    }

    c.fillStyle = '#00ff00';
    roundRect(c, this.f_btn.x, this.f_btn.y, this.f_btn.width, this.f_btn.height, this.f_btn.r, true)
    c.font = this.f_btn.height * .8 + "px Comic Sans MS";
    c.fillStyle = "white";
    c.textAlign = 'center';
    c.fillText('Download', this.f_btn.x + this.f_btn.width / 2, this.s_btn.y + this.s_btn.height / 2 + this.f_btn.height * .2);


    c.fillStyle = '#de0d4f';
    roundRect(c, this.s_btn.x, this.s_btn.y, this.s_btn.width, this.s_btn.height, this.s_btn.r, true)
    c.font = this.s_btn.height * .8 + "px Comic Sans MS";
    c.fillStyle = "white";
    c.textAlign = 'center';
    c.fillText('Restart', this.s_btn.x + this.s_btn.width / 2, this.s_btn.y + this.s_btn.height / 2 + this.s_btn.height * .2);

    c.restore()
}

p.setUIListeners = function () {
    let ctx = this

    let key_cb = function (e) {
        switch (e.keyCode) {
            case 37:
                ctx.foc_btn = ctx.foc_btn - 1 < 0 && 1 || 0
                break;

            case 39:
                ctx.foc_btn = ctx.foc_btn + 1 < 2 && 1 || 0
                break;

            case 13:
                fin_cb()
                break;
        }
    }

    let checkIntersection = function (e, btn) {
        let x = e.clientX - ctx.bounds.x
        let y = e.clientY - ctx.bounds.top

        return !(x < btn.x || x > btn.x + btn.width || y < btn.y || y > btn.y + btn.height)
    }

    let move_cb = function (e) {
        let btn = !ctx.foc_btn && ctx.f_btn || ctx.s_btn
        ctx.foc_btn = checkIntersection(e, btn) ? 1 - ctx.foc_btn : ctx.foc_btn
    }

    let click_cb = function (e) {
        checkIntersection(e, ctx.s_btn) && fin_cb()
    }

    let fin_cb = function () {
        if (ctx.foc_btn) return false

        new Ads(document.getElementById('ad-container'), document.getElementById('video-element'), function () {
            ctx.restart()
        }.bind(this))

        window.removeEventListener('keyup', key_cb)
        window.removeEventListener('mousemove', move_cb)
        window.removeEventListener('click', click_cb)
    }

    window.addEventListener('keyup', key_cb)
    window.addEventListener('mousemove', move_cb)
    window.addEventListener('click', click_cb)
}

p.restart = function () {
    this.game_state = 0

    this.values = new Array(pow(this.dimension, 2));

    if (random() > .5) {
        this.player_index = 'x'
        this.bot_index = 'o'
    } else {
        this.player_index = 'o'
        this.bot_index = 'x'
    }

    this.bot_win_pattern = '';
    this.player_win_pattern = '';
    for (let i = 0; i < this.dimension; i++) {
        this.bot_win_pattern += this.bot_index
        this.player_win_pattern += this.player_index
    }

    if (this.player_index === 'x') {
        this.setPlayListeners()
        this.focus = 4
    } else {
        this.focus = NaN
        this.botPlay()
    }
}

p.resize = function () {
    w = this.canvas.width = 1280,
        h = this.canvas.height = 720

    this.bounds = this.canvas.getBoundingClientRect()

    this.desk_size = min(h - 100, w);

    this.border_width = this.desk_size * .04 / this.dimension;

    this.margin = [(w - this.desk_size) / 2, (h - this.desk_size - 100) / 2 + 100];

    this.soket_size = (this.desk_size - this.border_width) / this.dimension

    this.f_btn = {
        x: w / 2 - 250,
        y: h / 2 - 25,
        width: 200,
        height: 50,
        r: 10
    }

    this.s_btn = {
        x: w / 2 + 50,
        y: h / 2 - 25,
        width: 200,
        height: 50,
        r: 10
    }
}

Object.assign(Game.prototype, p)