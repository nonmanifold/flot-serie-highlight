
/*
Modified by Nick Serebrennikov to add support for polar graphs
*/

(function ($) {
	var options = {
		series: { lines: { highlightLineWidth: 3 } }
	};

	function init(plot) {
		var _labels = [];
		var _timeRangeId = null;
		plot.setHighlightedSeries = function (labels, timeRangeId) {
			plot.clearHightlights();
			if (!labels) {
				plot.triggerRedrawOverlay();
				return;
			}
			_timeRangeId = timeRangeId;
			for (var i = 0; i < labels.length; i++) {
				var label = labels[i];
				_labels.push(label);
			}
			plot.triggerRedrawOverlay();
		};

		plot.clearHightlights = function () {
			_labels.splice(0, _labels.length);
			_timeRangeId = null;
			plot.triggerRedrawOverlay();
		};

		plot.hooks.drawOverlay.push(function (plot, ctx) {
			var plotOffset = plot.getPlotOffset();
			ctx.save();
			// ctx.translate(plotOffset.left, plotOffset.top);
			var opts = plot.getOptions();
			var series = plot.getData();
			var highlightColor = opts.crosshair.color;
			for (var i = 0; i < series.length; i++) {
				if (series[i].timeRangeId === _timeRangeId && vm.inArray(series[i].label, _labels) >= 0) {
					if (opts.series.polar.show) {
						plot.drawSerie(ctx, series[i], highlightColor, opts.series.lines.highlightLineWidth);
					} else {
						ctx.save();
						ctx.translate(plotOffset.left, plotOffset.top);
						plot.drawSerieAsLines(ctx, series[i], highlightColor, opts.series.lines.highlightLineWidth);
						ctx.restore();
					}
				}
			}
			ctx.restore();
		});

		plot.drawSerieAsLines = function (ctx, series, color, lineWidth) {
			var axisx = series.xaxis;
			var axisy = series.yaxis;
			ctx.save();
			ctx.lineJoin = "round";
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = color;
			var points = series.datapoints.points;
			var ps = series.datapoints.pointsize;
			var prevx = null;
			var prevy = null;

			var xoffset = 0;
			var yoffset = 0;

			ctx.beginPath();
			for (var i = ps; i < points.length; i += ps) {
				var x1 = points[i - ps], y1 = points[i - ps + 1],
						x2 = points[i], y2 = points[i + 1];

				if (x1 == null || x2 == null)
					continue;

				// clip with ymin
				if (y1 <= y2 && y1 < axisy.min) {
					if (y2 < axisy.min)
						continue;   // line segment is outside
					// compute new intersection point
					x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
					y1 = axisy.min;
				}
				else if (y2 <= y1 && y2 < axisy.min) {
					if (y1 < axisy.min)
						continue;
					x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
					y2 = axisy.min;
				}

				// clip with ymax
				if (y1 >= y2 && y1 > axisy.max) {
					if (y2 > axisy.max)
						continue;
					x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
					y1 = axisy.max;
				}
				else if (y2 >= y1 && y2 > axisy.max) {
					if (y1 > axisy.max)
						continue;
					x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
					y2 = axisy.max;
				}

				// clip with xmin
				if (x1 <= x2 && x1 < axisx.min) {
					if (x2 < axisx.min)
						continue;
					y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
					x1 = axisx.min;
				}
				else if (x2 <= x1 && x2 < axisx.min) {
					if (x1 < axisx.min)
						continue;
					y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
					x2 = axisx.min;
				}

				// clip with xmax
				if (x1 >= x2 && x1 > axisx.max) {
					if (x2 > axisx.max)
						continue;
					y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
					x1 = axisx.max;
				}
				else if (x2 >= x1 && x2 > axisx.max) {
					if (x1 > axisx.max)
						continue;
					y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
					x2 = axisx.max;
				}

				if (x1 != prevx || y1 != prevy)
					ctx.moveTo(axisx.p2c(x1) + xoffset, axisy.p2c(y1) + yoffset);

				prevx = x2;
				prevy = y2;
				ctx.lineTo(axisx.p2c(x2) + xoffset, axisy.p2c(y2) + yoffset);
			}
			ctx.stroke();
			ctx.restore();
		};
	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'serie-highlight',
		version: '0.1'
	});
})(jQuery);
