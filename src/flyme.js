var html5VideoCapture = {
	onFailSoHard: function(a) {
		if (a.code == 1) {
			alert("You didn't allow the camera, so nothing is going to happen!")
		} else {
			alert("Camera access is not supported in your browser, please try Chrome or Firefox.")
		}
	},
	localMediaStream: null,
	video: null,
	canvas: null,
	sizeCanvas: function() {
		var a = this;
		setTimeout(function() {
			var c = a.resizeCanvasToCamera ? a.video.videoWidth : a.canvas.width;
			var b = a.resizeCanvasToCamera ? a.video.videoHeight : a.canvas.height;
			a.canvas.width = c;
			a.canvas.height = b
		}, 100)
	},
	start: function() {
		var a = this;
		if (navigator.getUserMedia) {
			navigator.getUserMedia("video", function(b) {
				a.video.src = b;
				a.localMediaStream = b;
				a.sizeCanvas.call(a)
			}, this.onFailSoHard)
		} else {
			if (navigator.webkitGetUserMedia) {
				navigator.webkitGetUserMedia({
					video: true
				}, function(b) {
					a.video.src = window.webkitURL.createObjectURL(b);
					a.localMediaStream = b;
					a.sizeCanvas.call(this)
				}, this.onFailSoHard)
			} else {
				if (navigator.mozGetUserMedia) {
					navigator.mozGetUserMedia({
						video: true
					}, function(b) {
						a.video.src = window.URL.createObjectURL(b);
						a.localMediaStream = b;
						a.sizeCanvas.call(this)
					}, this.onFailSoHard)
				} else {
					this.onFailSoHard({
						target: this.video
					})
				}
			}
		}
	},
	config: {
		selectors: {
			video: null,
			canvas: null,
			buttons: {
				start: null,
				screenshot: null,
				stop: null
			},
			secondaryCanvases: []
		},
		resizeCanvasToCamera: true
	},
	snapshot: function(c, b) {
		var a = b.getContext("2d");
		a.drawImage(c, 0, 0, b.width, b.height)
	},
	init: function(d) {
		if (d) {
			$.extend(true, this.config, d)
		}
		var a = this;
		this.video = document.querySelector(this.config.selectors.video);
		var c = document.querySelector(this.config.selectors.buttons.screenshot);
		var b = document.querySelector(this.config.selectors.buttons.start);
		this.canvas = document.querySelector(this.config.selectors.canvas);
		if (c) {
			c.addEventListener("click", function(g) {
				if (a.localMediaStream) {
					a.snapshot(a.video, a.canvas);
					if (a.config.selectors.secondaryCanvases instanceof Array) {
						for (i in a.config.selectors.secondaryCanvases) {
							var f = document.querySelector(a.config.selectors.secondaryCanvases[i]);
							a.snapshot(a.video, f)
						}
					}
					return
				}
			}, false)
		}
		if (b) {
			b.addEventListener("click", function(f) {
				a.start.call(this)
			}, false)
		}
		this.video.addEventListener("click", this.snapshot, false);
		document.querySelector(this.config.selectors.buttons.stop).addEventListener("click", function(f) {
			a.video.pause();
			a.localMediaStream.stop()
		}, false)
	}
};
var keypad = {
	phone: null,
	display: null,
	buttonsContainer: null,
	interacting: false,
	getNum: function(a) {
		return a.data("value")
	},
	getT9: function(a) {
		var b = "<div>" + a.html() + "</div>";
		return $(b).find("span:first").html()
	},
	write: function(a) {
		if (keypad.interacting && keypad.display.html().length >= 12) {
			return false
		}
		if (keypad.interacting) {
			keypad.display.append(a)
		} else {
			keypad.display.html(a);
			keypad.interacting = true
		}
	},
	backspace: function() {
		var a = keypad.display.html();
		return keypad.display.html(a.substring(0, a.length - 1))
	},
	bindClicks: function() {
		keypad.buttonsContainer.on("mousedown.keypad", "li", function() {
			keypad.unpressAll();
			$(this).addClass("pressing");
			keypad.write(keypad.getNum($(this)))
		});
		keypad.buttonsContainer.on("mouseup.keypad", "li", function() {
			keypad.unpressAll()
		});
		keypad.buttonsContainer.on("click.keypad", "i.delete", function() {
			keypad.backspace()
		})
	},
	unpressAll: function() {
		$("ul li", keypad.buttonsContainer).removeClass("pressing")
	},
	performKeyPress: function(a) {
		var c = $(a);
		c.addClass("pressing");
		var b = keypad.getNum(c);
		if (b) {
			keypad.write(b)
		}
		$(document).one("keyup.keypad", function() {
			$(a).removeClass("pressing")
		})
	},
	bindKeys: function() {
		$(document).on("keydown.keypad", function(a) {
			var c = a.which;
			if (c > 57) {
				c = c - 48
			}
			if (c >= 48 && c <= 57) {
				var b = "li[data-value=" + String.fromCharCode(c) + "]";
				keypad.performKeyPress(b);
				return
			}
			if (c === 8) {
				a.preventDefault();
				keypad.backspace()
			}
		})
	},
	unbindAll: function() {
		$(document).unbind(".keypad");
		keypad.buttonsContainer.unbind(".keypad")
	},
	init: function() {
		keypad.display = $("div.number");
		keypad.buttonsContainer = $("#phone");
		keypad.unbindAll();
		keypad.bindClicks();
		keypad.bindKeys()
	}
};
var keyboard = {
	interacting: false,
	display: null,
	keyboardContainer: null,
	getVal: function(a) {
		return a.data("value")
	},
	write: function(a) {
		this.display.val(this.display.val() + a)
	},
	clear: function() {
		this.display.val("")
	},
	backspace: function() {
		var a = this.display.val();
		return this.display.val(a.substring(0, a.length - 1))
	},
	bindClicks: function() {
		var a = this;
		this.keyboardContainer.on("mousedown.keyboard", "ul li", function() {
			a.unpressAll.call(a);
			$(this).addClass("pressing");
			var b = $(this);
			if (!a.interacting) {
				a.clear.call(a);
				a.interacting = true
			}
			if (b.hasClass("delete")) {
				a.backspace.call(a);
				return
			}
			var c = a.getVal.call(a, b);
			if (c) {
				a.write.call(a, c)
			}
		});
		this.keyboardContainer.on("mouseup.keyboard", "li", function() {
			a.unpressAll.call(a)
		})
	},
	unpressAll: function() {
		$("ul li", this.keyboardContainer).removeClass("pressing")
	},
	performKeyPress: function(a) {
		var b = $(a);
		b.addClass("pressing");
		if (!this.display.is(":focus")) {
			var c = this.getVal.call(this, b);
			if (c) {
				this.write.call(this, c)
			}
		}
		$(document).one("keyup.keyboard", function() {
			$(a).removeClass("pressing")
		})
	},
	bindKeys: function() {
		var a = this;
		$(document).on("keydown.keyboard", function(b) {
			var d = b.which;
			if (!a.interacting) {
				a.clear.call(a);
				a.interacting = true
			}
			if (d >= 65 && d <= 90) {
				var c = "li[data-value=" + String.fromCharCode(d).toLowerCase() + "]";
				a.performKeyPress.call(a, c);
				return
			}
			if (d === 32) {
				b.preventDefault();
				if (a.display.is(":focus")) {
					a.write.call(a, " ")
				}
				a.performKeyPress.call(a, "li.space")
			}
			if (d === 8) {
				b.preventDefault();
				a.backspace.call(a);
				a.performKeyPress.call(a, "li.delete")
			}
		})
	},
	unbindAll: function() {
		$(document).unbind(".keyboard");
		this.keyboardContainer.unbind(".keyboard")
	},
	init: function() {
		this.display = $("#messages-input");
		this.keyboardContainer = $("div.keyboard");
		this.display.focus();
		this.unbindAll.call(this);
		this.bindClicks.call(this);
		this.bindKeys()
	}
};
var volumeControl = {
	selectors: {
		buttons: {
			up: "b.volume.up",
			down: "b.volume.down"
		},
		overlay: "div.volume-overlay",
		indicators: "div.volume-overlay ul li"
	},
	timers: {
		hideOverlay: null
	},
	volume: 0,
	showOverlay: function() {
		var a = this;
		clearTimeout(this.timers.hideOverlay);
		$(this.selectors.overlay).stop(true, true).show();
		this.timers.hideOverlay = setTimeout(function() {
			$(a.selectors.overlay).fadeOut(750)
		}, 2000)
	},
	increaseVolume: function() {
		this.showOverlay.call(this);
		if (this.volume >= 15) {
			return
		}
		this.volume++;
		this.updateIndicators.call(this)
	},
	decreaseVolume: function() {
		this.showOverlay.call(this);
		if (this.volume <= 1) {
			return
		}
		this.volume--;
		this.updateIndicators.call(this)
	},
	updateIndicators: function() {
		$(this.selectors.indicators).removeClass("on");
		var a = this.selectors.indicators + ":lt(" + this.volume + ")";
		$(a).addClass("on")
	},
	init: function() {
		var a = this;
		$("#iPhone").on("click", this.selectors.buttons.up, function() {
			a.increaseVolume.call(a)
		});
		$("#iPhone").on("click", this.selectors.buttons.down, function() {
			a.decreaseVolume.call(a)
		})
	}
};
$(function() {
	$("#slider").slider({
		animate: true,
		value: 1,
		min: 1,
		max: 100,
		step: 1,
		stop: function(g, h) {
			if ((h.value > 90)) {
				var f = $("#iPhone");
				f.removeClass().addClass("on");
				$(".lock-screen").hide();
				$(".ui-slider-handle").animate({
					left: 0
				}, 150);
				$(".content .app-info").hide();
				$(".content #homescreen-content").show();
				$(".notification.messages, .icon.messages .count").delay(3000).fadeIn(100)
			} else {
				$(".ui-slider-handle").animate({
					left: 0
				}, 150);
				$("#slider span.text").fadeIn("fast")
			}
		}
	});
	$(document).on("click", "#iPhone b.lock", function() {
		var f = $("#iPhone");
		switch (true) {
			case f.hasClass("off"):
				f.removeClass("off").addClass("locked");
				$(".lock-screen").show();
				$(".content .app-info").hide();
				$(".content #locked-content").show();
				break;
			case f.hasClass("on"):
				f.removeClass("on").addClass("off");
				$("#camera").hide();
				$("#pull-down").hide();
				$(".content .app-info").hide();
				$(".content #off-content").show();
				break;
			case f.hasClass("locked"):
				f.removeClass().addClass("off");
				$(".content .app-info").hide();
				$(".content #off-content").show();
				break;
			case f.hasClass("show-app"):
				$(".app").hide();
				f.removeClass().addClass("on");
				$(".content .app-info").hide();
				$(".content #off-content").show();
				break
		}
	});
	$("#iPhone").on("click", "b.home", function(f) {
		var g = $("#iPhone");
		switch (true) {
			case g.hasClass("off"):
				g.removeClass("off").addClass("locked");
				$(".lock-screen").show();
				$(".content .app-info").hide();
				$(".content #locked-content").show();
				break;
			case g.hasClass("show-app"):
				$(".app").hide();
				g.removeClass().addClass("on");
				$("#pull-down").slideUp(200);
				$(".content .app-info").hide();
				$(".content #homescreen-content").show();
				break;
			case g.hasClass("on"):
				$(".app").hide();
				$("#pull-down").slideUp(200);
				$(".content .app-info").hide();
				$(".content #homescreen-content").show();
				break
		}
	});
	if ($("#iPhone").hasClass("off")) {
		$("#off-content").show()
	}
	$(document).on("click", "ul#colours li a", function() {
		return false
	});
	$(document).on("click", "ul#colours li a.black", function() {
		$("#colour").removeClass().addClass("black")
	});
	$(document).on("click", "ul#colours li a.white", function() {
		$("#colour").removeClass().addClass("white")
	});
	$(document).on("click", "ul#colours li a.red", function() {
		$("#colour").removeClass().addClass("red")
	});
	$(document).on("click", "ul#colours li a.blue", function() {
		$("#colour").removeClass().addClass("blue")
	});
	$(document).on("click", "ul#colours li a.pink", function() {
		$("#colour").removeClass().addClass("pink")
	});
	$(document).on("click", "ul#colours li a.gold", function() {
		$("#colour").removeClass().addClass("gold")
	});
	$(document).on("click", ".lock-screen b.camera-btn, #messages .bottom-bar b", function() {
		$("#iPhone").addClass("show-app");
		$(".lock-screen").slideUp(300);
		$("#camera").fadeIn();
		html5VideoCapture.init.call(html5VideoCapture, {
			selectors: {
				video: "#live_video",
				canvas: "#canvas",
				buttons: {
					screenshot: "#snapshot",
					stop: "b.home"
				},
				secondaryCanvases: ["#mini-photo"]
			},
			resizeCanvasToCamera: false
		});
		html5VideoCapture.start.call(html5VideoCapture);
		return false
	});
	$("#iPhone").on("click swipe", "i.recombu", function() {
		$("#iPhone").addClass("show-app");
		if (screen.width <= 800) {
			$("#recombu-iframe").attr("src", "http://recombu.com/mobile/")
		} else {
			$("#recombu-iframe").attr("src", "http://recombu.com/mobile/").attr("scrolling", "yes")
		}
		$("iframe.recombu").show();
		$(".content .app-info").hide();
		$(".content #recombu-content").show()
	});
	$("#iPhone .icon.calendar").click(function() {
		$("#iPhone").addClass("show-app");
		$("#calendar").show();
		$(".content .app-info").hide();
		$(".content #calendar-content").show()
	});
	$("#iPhone .icon.reminders").click(function() {
		$("#iPhone").addClass("show-app");
		$("#reminders").show();
		$(".content .app-info").hide();
		$(".content #reminders-content").show()
	});
	$("#iPhone .icon.notes").click(function() {
		$("#iPhone").addClass("show-app");
		$("#notes").show();
		$(".content .app-info").hide();
		$(".content #notes-content").show()
	});
	$("#iPhone .icon.phone").click(function() {
		$("#iPhone").addClass("show-app");
		$("#phone").show();
		keypad.init();
		$(".content .app-info").hide();
		$(".content #phone-content").show()
	});
	$("#iPhone .icon.mail").click(function() {
		$("#iPhone").addClass("show-app");
		$("#mail").show();
		$(".content .app-info").hide();
		$(".content #mail-content").show()
	});
	$("#iPhone .icon.safari").click(function() {
		$("#iPhone").addClass("show-app");
		if (screen.width <= 800) {
			$("#safari-iframe").attr("src", "http://recombu.com/mobile/")
		} else {
			$("#safari-iframe").attr("src", "http://recombu.com/mobile/").attr("scrolling", "yes")
		}
		$("#safari").show();
		$(".content .app-info").hide();
		$(".content #safari-content").show()
	});
	$("#iPhone .icon.music").click(function() {
		$("#iPhone").addClass("show-app");
		$("#music").show();
		$(".content .app-info").hide();
		$(".content #music-content").show()
	});
	$("#iPhone i.camera").click(function() {
		$("#camera").show();
		$("#iPhone").addClass("show-app");
		$(".content .app-info").hide();
		$(".content #camera-content").show();
		html5VideoCapture.init.call(html5VideoCapture, {
			selectors: {
				video: "#live_video",
				canvas: "#canvas",
				buttons: {
					screenshot: "#snapshot",
					stop: "b.home"
				},
				secondaryCanvases: ["#mini-photo"]
			},
			resizeCanvasToCamera: false
		});
		html5VideoCapture.start.call(html5VideoCapture)
	});
	$(".notification.messages b.close").click(function() {
		$(".notification.messages").fadeOut(100)
	});
	$(".notification.messages b.view, #iPhone .icon.messages").click(function() {
		$("#iPhone").addClass("show-app");
		$(".notification.messages, .icon.messages .count").hide(100);
		$("#messages").show();
		$(".content .app-info").hide();
		$(".content #messages-content").show()
	});
	$(".time-date").click(function() {
		$(".time-date").animate({
			left: "-312px"
		})
	});
	$(".status-bar .btn").click(function() {
		$("#pull-down").slideToggle(200);
		// $(this).css({background:'#111',opacity:'0.9'});
		
	});
	$("#pull-down b.handle-btn").click(function() {
		$("#pull-down").slideUp(200)
		// $('.status-bar').css({opacity:'1',background:'#fff'});
	});
	$("#messages input").click(function() {
		$("#messages .ctr").animate({
			top: "-190px"
		}, 200, "linear");
		keyboard.init.call(keyboard)
	});
	$("#messages .ctr ul").click(function() {
		keyboard.unbindAll.call(keyboard);
		$("#messages .ctr").animate({
			top: "0"
		}, 200, "linear")
	});
	var b;
	$("ul.widgets").on("click", "li", function() {
		clearTimeout(b);
		b = setTimeout(function() {
			$(".time-date").animate({
				left: 0
			})
		}, 2000)
	});
	volumeControl.init.call(volumeControl);
	var d = {
		states: {},
		detectState: function(f) {
			return !$("ul.widgets li." + f).hasClass("off")
		},
		storeState: function(f) {
			d.states[f] = d.detectState(f)
		},
		restore: function() {
			for (var g in d.states) {
				if (!d.states.hasOwnProperty(g)) {
					continue
				}
				var f = "ul.widgets li." + g + ", .status-bar i." + g;
				if (d.states[g]) {
					$(f).removeClass("off")
				} else {
					$(f).addClass("off")
				}
			}
		},
		init: function() {
			$("ul.widgets li").each(function() {
				var g = $(this);
				var f = g.attr("class").split(" ")[0];
				d.states[f] = d.detectState(f)
			})
		}
	};
	d.init();
	var c = function() {
		return !$("ul.widgets li.airplane").hasClass("off")
	};
	$.each(["wifi", "bluetooth", "location"], function(f, g) {
		$("ul.widgets").on("click", "li." + g, function() {
			if (c()) {
				return true
			}
			$("ul.widgets li." + g + ", .status-bar i." + g).toggleClass("off");
			d.storeState(g)
		})
	});
	var a = [];
	var e;
	$("ul.widgets").on("click", "li.airplane", function() {
		for (var f = 0; f < a.length; f++) {
			clearTimeout(a[f])
		}
		clearInterval(e);
		if (c()) {
			$(".status-bar i.airplane").addClass("off");
			$(".status-bar .network").removeClass("off");
			d.restore();
			$(".status-bar ul.signal").removeClass("off").find("li").addClass("no-signal");
			$(".status-bar ul.signal li:nth-child(1)").removeClass("no-signal");
			a.push(setTimeout(function() {
				var g = 0;
				e = setInterval(function() {
					if (g > 5) {
						$(".status-bar ul.signal li:nth-child(5)").addClass("no-signal");
						a.push(setTimeout(function() {
							$(".status-bar ul.signal li:nth-child(5)").removeClass("no-signal")
						}, 2500));
						clearInterval(e);
						return
					}
					g++;
					$(".status-bar ul.signal li:nth-child(" + (g + 1) + ")").removeClass("no-signal")
				}, 1000)
			}, 500));
			return
		}
		$("ul.widgets li.airplane, .status-bar i.airplane, .status-bar ul.signal, .status-bar .network").toggleClass("off");
		$("ul.widgets li.wifi, .status-bar i.wifi, ul.widgets li.bluetooth, .status-bar i.bluetooth, ul.widgets li.location, .status-bar i.location").addClass("off")
	})
});

function myDate() {
	var c = new Date();
	var a = c.getHours();
	document.getElementById("hour").innerHTML = a;
	document.getElementById("hour2").innerHTML = a;
	var b = c.getMinutes();
	if (b < 10) {
		document.getElementById("minute").innerHTML = "0" + b;
		document.getElementById("minute2").innerHTML = "0" + b
	} else {
		document.getElementById("minute").innerHTML = b;
		document.getElementById("minute2").innerHTML = b
	}
}
myDate();
setInterval(function() {
	myDate()
}, 1000);
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var newDate = new Date();
newDate.setDate(newDate.getDate());
$("#date").html(dayNames[newDate.getDay()] + " " + newDate.getDate() + " " + monthNames[newDate.getMonth()]);
$("#cal-date").html(dayNames[newDate.getDay()]);
$("#cal-day").html(newDate.getDate());
$("#cal-date2").html(dayNames[newDate.getDay()]);
$("#cal-day2").html(newDate.getDate());
$("#cal-date3").html(dayNames[newDate.getDay()]);
$("#cal-day3").html(newDate.getDate());