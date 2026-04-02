/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

$lib.Drawing.roundReady = function (data, spec) {
  var tv = L['jqTheme'] + ': ' + L['theme_' + data.theme]

  clearBoard()
  $('.jjoriping,.rounds,.game-body').addClass('cw')
  $('.jjoriping,.rounds').addClass('dg')
  $('.game-user-drawing').removeClass('game-user-drawing')
  $stage.game.tools.hide()
  $data._relay = false
  $data._roundTime = $data.room.time * 1000
  $data._fastTime = 10000
  $data._fullImageString = ""
  $data._remoteStroke = null
  $stage.game.items.hide()
  $stage.game.hints.show()
  $stage.game.cwcmd.show().css('opacity', 0)
  if ($data.id === data.painter) {
    console.log('i\'m painter!')
    $data._isPainter = true
  } else {
    $data._isPainter = false
  }
  $('#game-user-' + data.painter).addClass('game-user-drawing')
  drawRound(data.round)
  playSound('round_start')
  clearInterval($data._tTime)
}
$lib.Drawing.turnStart = function (data, spec) {
  $('.game-user-current').removeClass('game-user-current')
  $('.game-user-bomb').removeClass('game-user-bomb')
  if ($data.room.game.seq.indexOf($data.id) >= 0) {
    if (!$data._isPainter) {
      $stage.game.hints.show()
      $stage.game.tools.hide()

      $data._relay = true
    } else {
      $('#drawing-line-width').change(function () {
        console.log(this.value)
        $stage.game.canvas.freeDrawingBrush.width = this.value
      })
      $('#drawing-color').change(function () {
        console.log(this.value)
        $stage.game.canvas.freeDrawingBrush.color = this.value
      })
      $('#drawing-clear').click(function () {
        console.log('clear')
        $stage.game.canvas.clear()
        $data._fullImageString = JSON.stringify($stage.game.canvas)
        send('drawingStroke', { phase: 'clear' }, false)
      })
      $('.button-color#color-red').click(function() {
        console.log('change red')
        $stage.game.canvas.freeDrawingBrush.color = '#FF0000'
      })
      $('.button-color#color-orange').click(function() {
        console.log('change orange')
        $stage.game.canvas.freeDrawingBrush.color = '#FFA500'
      })
      $('.button-color#color-yellow').click(function() {
        console.log('change yellow')
        $stage.game.canvas.freeDrawingBrush.color = '#FFFF00'
      })
      $('.button-color#color-green').click(function() {
        console.log('change green')
        $stage.game.canvas.freeDrawingBrush.color = '#008000'
      })
      $('.button-color#color-blue').click(function() {
        console.log('change blue')
        $stage.game.canvas.freeDrawingBrush.color = '#0000FF'
      })
      $('.button-color#color-indigo').click(function() {
        console.log('change indigo')
        $stage.game.canvas.freeDrawingBrush.color = '#4B0082'
      })
      $('.button-color#color-violet').click(function() {
        console.log('change red')
        $stage.game.canvas.freeDrawingBrush.color = '#9400D3'
      })
      $('.button-color#color-black').click(function() {
        console.log('change black')
        $stage.game.canvas.freeDrawingBrush.color = '#000000'
      })
      $('.button-color#color-white').click(function() {
        console.log('change white')
        $stage.game.canvas.freeDrawingBrush.color = '#FFFFFF'
      })

      $stage.game.drawingTitle.text(data.word)
      $stage.game.themeisTitle.text(L['theme_' + data.theme])

      $stage.game.hints.hide()
      $stage.game.tools.show()

      $('.rounds').removeClass('dg')
      $('.rounds').addClass('painter')
    }
  }
  $lib.Drawing.drawDisplay()
  clearInterval($data._tTime)
  $data._tTime = addInterval(turnGoing, TICK)
  playBGM('jaqwi')
}
$lib.Drawing.turnHint = function (data) {
  var hint
  if (Array.isArray(data.hint)) {
    hint = L['theme_' + data.hint[0]]
  } else {
    hint = data.hint
  }
  playSound('mission')
  pushHint(hint)
}
$lib.Drawing.turnEnd = function (id, data) {
  var $sc = $('<div>').addClass('deltaScore').html('+' + data.score)
  var $uc = $('#game-user-' + id)

  if (data.giveup) {
    $uc.addClass('game-user-bomb')
    $data._relay = false
  } else if (data.answer) {
    $stage.game.here.hide()
    $stage.game.display.html($('<label>').css('color', '#FFFF44').html(data.answer))
    stopBGM()
    playSound('horr')
    $data._relay = false
  } else {
    // if(data.mean) turnHint(data);
    if (id == $data.id) $stage.game.here.hide()
    addScore(id, data.score)
    if ($data._roundTime > 10000) $data._roundTime = 10000
    drawObtainedScore($uc, $sc)
    updateScore(id, getScore(id)).addClass('game-user-current')
    playSound('success')
  }
}
$lib.Drawing.drawDisplay = function () {
  var $pane = $stage.game.display.empty()

  $pane.append($('<canvas>')
    .attr('id', 'canvas')
    .css({
      width: '300',
      height: '300',
      left: 0,
      top: 0
    })
    .addClass('canvas')
  )

  var canvas = window._canvas = new fabric.Canvas('canvas')
  canvas.backgroundColor = '#ffffff'
  canvas.isDrawingMode = $data._isPainter
  canvas.setHeight(300)
  canvas.setWidth(300)
  canvas.selection = false

  $('#drawing-line-width').val(20)
  $('#drawing-color').val('#000000')
  $data._remoteStroke = null

  if ($data._isPainter) {
    var drawingDown = false
    var lastSendAt = 0
    var DRAW_SEND_INTERVAL = 130
    var DRAW_SEND_MIN_DISTANCE = 3.5
    var lastSentPoint = null

    function sendStroke(phase, point){
      var width = Number(canvas.freeDrawingBrush && canvas.freeDrawingBrush.width) || 1
      var color = (canvas.freeDrawingBrush && canvas.freeDrawingBrush.color) || '#000000'
      send('drawingStroke', {
        phase: phase,
        x: Math.round(point.x * 100) / 100,
        y: Math.round(point.y * 100) / 100,
        width: width,
        color: color
      }, false)
      lastSendAt = Date.now()
      lastSentPoint = { x: point.x, y: point.y }
    }

    canvas.on('mouse:down', function (opt) {
      var p = canvas.getPointer(opt.e)
      drawingDown = true
      sendStroke('start', p)
    })
    canvas.on('mouse:move', function (opt) {
      if (!drawingDown) return
      if (Date.now() - lastSendAt < DRAW_SEND_INTERVAL) return
      var p = canvas.getPointer(opt.e)
      if (lastSentPoint) {
        var dx = p.x - lastSentPoint.x
        var dy = p.y - lastSentPoint.y
        if ((dx * dx + dy * dy) < (DRAW_SEND_MIN_DISTANCE * DRAW_SEND_MIN_DISTANCE)) return
      }
      sendStroke('move', p)
    })
    canvas.on('mouse:up', function (opt) {
      if (drawingDown) sendStroke('end', canvas.getPointer(opt.e))
      drawingDown = false
      lastSentPoint = null
    })
    $(window).off('mouseup.drawingStrokeEnd').on('mouseup.drawingStrokeEnd', function () {
      if (!drawingDown) return
      if (lastSentPoint) sendStroke('end', lastSentPoint)
      drawingDown = false
      lastSentPoint = null
    })
    canvas.on('path:created', function(){
      $data._fullImageString = JSON.stringify(canvas)
    })
  }
  canvas.renderAll()
  $stage.game.canvas = canvas
}

$lib.Drawing.drawStroke = function (msg) {
  if ($data._isPainter) return
  if (!$stage.game.canvas) return

  var canvas = $stage.game.canvas

  if (msg.phase === 'clear') {
    canvas.clear()
    canvas.backgroundColor = '#ffffff'
    canvas.renderAll()
    $data._fullImageString = JSON.stringify(canvas)
    $data._remoteStroke = null
    return
  }

  if (!isFinite(msg.x) || !isFinite(msg.y)) return

  var point = { x: Number(msg.x), y: Number(msg.y) }
  var width = Math.max(1, Math.min(60, Number(msg.width) || 1))
  var color = msg.color || '#000000'

  if (msg.phase === 'start') {
    $data._remoteStroke = { point: point, width: width, color: color }
    return
  }

  if (!$data._remoteStroke) {
    $data._remoteStroke = { point: point, width: width, color: color }
    return
  }

  var prev = $data._remoteStroke.point
  var line = new fabric.Line([ prev.x, prev.y, point.x, point.y ], {
    stroke: color,
    strokeWidth: width,
    selectable: false,
    evented: false,
    strokeLineCap: 'round'
  })

  canvas.add(line)
  canvas.renderAll()
  $data._remoteStroke = { point: point, width: width, color: color }

  if (msg.phase === 'end') {
    $data._fullImageString = JSON.stringify(canvas)
    $data._remoteStroke = null
  }
}
$lib.Drawing.turnGoing = function () {
  var $rtb = $stage.game.roundBar
  var bRate
  var tt

  if (!$data.room) clearInterval($data._tTime)
  $data._roundTime -= TICK

  tt = $data._spectate ? L['stat_spectate'] : ($data._roundTime * 0.001).toFixed(1) + L['SECOND']
  $rtb
    .width($data._roundTime / $data.room.time * 0.1 + '%')
    .html(tt)

  if (!$rtb.hasClass('round-extreme')) {
    if ($data._roundTime <= $data._fastTime) {
      bRate = $data.bgm.currentTime / $data.bgm.duration
      if ($data.bgm.paused) stopBGM()
      else playBGM('jaqwiF')
      $data.bgm.currentTime = $data.bgm.duration * bRate
      $rtb.addClass('round-extreme')
    }
  }
}
$lib.Drawing.drawCanvas = function (msg) {
  // { type: "drawCanvas", diffed: Boolean, data: String }
  if (!$data._isPainter) {
    var data = ""
    if(msg.diffed) {
      try {
        var diff = window.differ.patch_fromText(msg.data)
			  var diffResult = window.differ.patch_apply(diff, $data._fullImageString)

			  if(Array.isArray(diffResult[1]) && diffResult[1].every(function(v){ return v === true })) {
				  data = diffResult[0]
			  } else {
				  send('canvasNotValid', {}, false)
				  return
			  }
      } catch (e) {
        send('canvasNotValid', {}, false)
        return
      }
    } else {
      data = msg.data
    }

    try {
      JSON.parse(data)
    } catch (e) {
      send('canvasNotValid', {}, false)
      return
    }

    $stage.game.canvas.clear()
    $stage.game.canvas.loadFromJSON(data, $stage.game.canvas.renderAll.bind($stage.game.canvas))
    $data._fullImageString = data
  }
}

$lib.Drawing.diffNotValid = function (msg) {
  // msg -> {}
  if ($data._isPainter) {
    send('drawingCanvas', {diffed: false, data: $data._fullImageString}, false)
  }
}