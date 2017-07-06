/*! Capture OnTheGo v2.0.0-beta-1 | (c) 2016 Objectif Lune, Inc. */

(function ( $ ) {
  // Global variables that are available to all COTG Widgets
  var browserSupportsSvg = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;

  $.fn.cotgSignature = function() {
    return this.each(function() {
      var widget = {
        object: $(this),
        container: $('[role=signature]', this),
        svgDataElem: $('[role=signature-data]', this),
        sigData: null,

        init: function() {
          // STANDARD DOM EVENTS
          widget.container.on('click.cotg', widget.onClick);

          // CUSTOM EVENTS
          widget.object.on('set.cotg', widget.onSet);
          widget.object.on('clear.cotg', widget.onClear);
          widget.object.on('save-state.cotg', widget.onSaveState);
          widget.object.on('restore-state.cotg', widget.onRestoreState);
          widget.object.on('draw.cotg', widget.onDraw);
        },

        /*
         * Draw the signature item to the panel inside the widget
         */
        onDraw: function() {
          if (!!widget.sigData) {
            var width = widget.container.width();
            var height = widget.container.height();

            if (browserSupportsSvg) {
              widget.container.html(navigator.handDrawTool.getSVG(widget.sigData, width, height));
            }
            else {
              widget.container.html('');

              var canvas = document.createElement('canvas');
              canvas.setAttribute('width', width);
              canvas.setAttribute('height', height);
              widget.container.append(canvas);
              navigator.handDrawTool.drawInContext(canvas.getContext('2d'), widget.sigData, width, height);
            }
          }
        },

        onClick: function(event) {
          var width = widget.container.width();
          var height = widget.container.height();

          navigator.handDrawTool.record(
            // call back
            function(data) {
              widget.svgDataElem.val(navigator.handDrawTool.getSVG(data, width, height));
              widget.object.trigger('set.cotg', data);
            }, { // options
              mode : 'signature',
              width : width,
              height : height
            }
          );
        },

        onSaveState: function(event, state) {
          state[widget.object.attr('id')] = widget.sigData;
        },

        onRestoreState: function(event, state) {
          widget.sigData = state[widget.object.attr('id')];
          if (!!widget.sigData) {
            document.addEventListener('deviceready', function() {
              widget.object.trigger('draw.cotg');
            }, false);
          }
        },

        onSet: function(event, data) {
          widget.sigData = data;
          if (!!widget.sigData) {
            widget.object.trigger('draw.cotg');
          }
        },

        onClear: function(event) {
          widget.sigData = null;
          widget.svgDataElem.val('');
          widget.container.html('');
        }
      };

      widget.init();
    });
  };

  $.fn.cotgDatePicker = function() {
    return this.each(function() {
      var widget = {
        object: $(this),
        isoDateInput: null,
        trigger: null,
        formattedDateInput: null,

        init: function() {
          if (widget.object.is('input') && widget.object.attr('role') === 'cotg.DatePicker') {
            // A plain input field with the datepicker role
            widget.isoDateInput = widget.object;
            widget.trigger = widget.isoDateInput;
            widget.formattedDateInput = $();
          } else if ($('[role=trigger]', widget.object).length > 0) {
            widget.isoDateInput = $('[role=date-data]', widget.object);
            if (widget.isoDateInput.length == 0) {
              widget.isoDateInput = $('[role=date]', widget.object);
              widget.formattedDateInput = $();
            } else {
              widget.formattedDateInput = $('[role=date]', widget.object);
            }
            widget.trigger = $('[role=trigger]', widget.object);
          } else {
            // Formatted date is shown, raw date is submitted via hidden
            widget.isoDateInput = $('[role=date-data]', widget.object);
            widget.formattedDateInput = $('[role=date]', widget.object);
            widget.trigger = widget.formattedDateInput;
          }
          widget.isoDateInput.prop("readonly", true);
          widget.formattedDateInput.prop("readonly", true);

          // STANDARD DOM EVENTS
          widget.trigger.on('click.cotg', widget.onClick);

          // CUSTOM EVENTS
          widget.object.on('set.cotg', widget.onSet);
          widget.object.on('clear.cotg', widget.onClear);
          widget.object.on('show-date-picker.cotg', widget.onShowDatePicker);
        },

        onClick: function(e) {
          var timeStamp = Date.parse(widget.isoDateInput.val());
          if (isNaN(timeStamp)) {
            widget.object.trigger('show-date-picker.cotg', new Date());
          } else {
            var parts = widget.isoDateInput.val().split("-");
            var date = new Date(parts[0], Number(parts[1]) - 1, parts[2]);
            widget.object.trigger('show-date-picker.cotg', date);
          }
        },

        onSet: function(event, date) {
          widget.set(date);
        },

        onClear: function() {
          widget.isoDateInput.val('');
          widget.formattedDateInput.val('');
        },

        onShowDatePicker: function(event, oldDate) {
          navigator.datePicker.show({
            date : oldDate,
            mode : 'date'
          }, widget.set);
        },

        set: function(date) {
          if (date !== undefined) {
            widget.isoDateInput.val(widget.generateISODateString(date));

            navigator.globalization.dateToString(date, function(date) {
              widget.formattedDateInput.val(date.value);
            }, null, {
              formatLength : 'short',
              selector : 'date'
            });
          }
        },

        generateISODateString: function(date) {
          var day = date.getDate();
          var month = date.getMonth() + 1;
          var year = date.getFullYear();
          var result = "";
          result += year;
          result += "-";
          result += month < 10 ? "0" + month : month;
          result += "-";
          result += day < 10 ? "0" + day : day;

          return result;
        }
      };

      widget.init();
    });
  };

  $.fn.cotgTimePicker = function() {
    return this.each(function() {
      var widget = {
        object: $(this),
        isoTimeInput: null,
        trigger: null,
        formattedTimeInput: null,

        init: function() {
          if (widget.object.is('input') && widget.object.attr('role') === 'cotg.TimePicker') {
            // A plain input field with the timepicker role
            widget.isoTimeInput = widget.object;
            widget.trigger = widget.isoTimeInput;
            widget.formattedTimeInput = $();
          } else if ($('[role=trigger]', widget.object).length > 0) {
            widget.isoTimeInput = $('[role=time-data]', widget.object);
            if (widget.isoTimeInput.length == 0) {
              widget.isoTimeInput = $('[role=time]', widget.object);
              widget.formattedTimeInput = $();
            } else {
              widget.formattedTimeInput = $('[role=time]', widget.object);
            }
            widget.trigger = $('[role=trigger]', widget.object);
          } else {
            // Formatted time is shown, raw time is submitted via hidden
            widget.isoTimeInput = $('[role=time-data]', widget.object);
            widget.formattedTimeInput = $('[role=time]', widget.object);
            widget.trigger = widget.formattedTimeInput;
          }
          widget.isoTimeInput.prop("readonly", true);
          widget.formattedTimeInput.prop("readonly", true);

          // STANDARD DOM EVENTS
          widget.trigger.on('click.cotg', widget.onClick);

          // CUSTOM EVENTS
          widget.object.on('set.cotg', widget.onSet);
          widget.object.on('clear.cotg', widget.onClear);
          widget.object.on('show-time-picker.cotg', widget.onShowTimePicker);
        },

        onClick: function(e) {
          navigator.globalization.stringToDate(widget.isoTimeInput.val(), function(date) {
            // success
            var time = new Date();
            t.setHours(date.hour);
            t.setMinutes(date.minute);
            widget.object.trigger('show-time-picker.cotg', time);
          }, function() {
            // error
            widget.object.trigger('show-time-picker.cotg', new Date());
          }, {
            // options
            formatLength: 'short',
            selector: 'time'
          });
        },

        onSet: function(event, date) {
          widget.set(date);
        },

        onClear: function() {
          widget.isoTimeInput.val('');
          widget.formattedTimeInput.val('');
        },

        onShowTimePicker: function(event, oldTime) {
          navigator.datePicker.show({
            date : oldTime,
            mode : 'time'
          }, widget.set);
        },

        set: function(time) {
          if (time !== undefined) {
            widget.formattedTimeInput.val(time.toLocaleTimeString());

            navigator.globalization.dateToString(time, function(time) {
              widget.isoTimeInput.val(time.value);
            }, null, {
              formatLength : 'short',
              selector : 'time'
            });
          }
        }
      };

      widget.init();
    });
  };

  $.fn.cotgGeolocation = function(options) {

    var settings = $.extend($.fn.cotgGeolocation.defaults, options);

    return this.each(function() {
      var widget = {
        object: $(this),
        dataElement: $('[role=geolocation-data]', this),
        infoElement: $('[role=geolocation-info]', this),
        getButton: $('[role=get-button]', this),

        init: function() {
          widget.getButton.on('click.cotg', widget.onUpdate);

          // CUSTOM EVENTS
          widget.object.on('clear.cotg', widget.onClear);
          widget.object.on('update.cotg', widget.onUpdate);
          widget.object.on('restore-state.cotg', widget.onRestoreState);
        },

        onClear: function() {
          widget.dataElement.val('');
          widget.infoElement.html('');
        },

        onUpdate: function() {
          var params = {};
          if (widget.object.attr('data-params')) {
            params = JSON.parse(widget.object.attr('data-params'));
          }
          var localSettings = $.extend(settings, params);
          navigator.geolocation.getCurrentPosition(widget.handleSuccess, widget.handleError, localSettings);
        },

        onRestoreState: function(event, state) {
          if (widget.dataElement.val().length > 0) {
            widget.showInfo(JSON.parse(widget.dataElement.val()));
          }
        },

        handleError: function(err) {
          widget.dataElement.val(JSON.stringify(err));
          widget.infoElement.html('Error ' + err.code + ': ' + err.message);
        },

        handleSuccess: function(position) {
          widget.dataElement.val(JSON.stringify(position, ['accuracy', 'altitude', 'altitudeAccuracy', 'heading', 'latitude', 'longitude', 'speed', 'timestamp', 'coords']));
          widget.showInfo(position);
        },

        showInfo: function(position) {
          if ("coords" in position) {
            var geo = '<p><strong>Latitude:</strong> ' + widget.degToDms(position.coords.latitude) + ' ('
              + position.coords.latitude + ')<br />' + '<strong>Longitude:</strong> '
              + widget.degToDms(position.coords.longitude) + ' (' + position.coords.longitude + ')<br />'
              + '<strong>Timestamp:</strong> ' + position.timestamp + '</p>';
            widget.infoElement.html(geo);
          }
        },

        degToDms: function(deg) {
          var d = Math.floor(deg);
          var minfloat = (deg - d) * 60;
          var m = Math.floor(minfloat);
          var secfloat = (minfloat - m) * 60;
          var s = Math.round(secfloat);
          if (s == 60) {
            m++;
            s = 0;
          }
          if (m == 60) {
            d++;
            m = 0;
          }
          return ('' + d + '&deg; ' + m + "' " + s + '"');
        }
      };

      widget.init();
    });
  };
  $.fn.cotgGeolocation.defaults = {
    enableHighAccuracy : false,
    maximumAge : 3000,
    timeout : 2700
  };

  $.fn.cotgPhotoWidget = function(options) {
    return this.each(function() {
      var widget = {
        object: $(this),
        imageElement: $('[role=photo]', this),
        imageDataElement: $('[role=photo-data]', this),
        takeButton: $('[role=take-button]', this),
        pickButton: $('[role=pick-button]', this),
        clearButton: $('[role=clear-button]', this),
        descElement: $('[role=photo-info]', this),
        settings: $.fn.cotgPhotoWidget.defaults,

        init: function(options) {
          widget.object.parents("label").click(function(event) {
            event.preventDefault();
          });

          //widget.imageElement.hide();
          if (widget.object.attr('data-params')) {
            widget.settings = $.extend(widget.settings, JSON.parse(widget.object.attr('data-params')));
          }

          widget.settings = $.extend(widget.settings, options);

          if (widget.settings.source === 'take' || widget.settings.source === 'takeandpick'
            || widget.settings.source === undefined) {
              widget.takeButton.click(function() {
                widget.getPicture(false)
              });
            } else {
              widget.takeButton.remove();
            }

          if (widget.settings.source === 'pick' || widget.settings.source === 'takeandpick'
            || widget.settings.source === undefined) {
              widget.pickButton.click(function() {
                widget.getPicture(true)
              });
            } else {
              widget.pickButton.remove();
            }

          widget.clearButton.click(widget.onClear);
          widget.clearButton.hide();

          if (widget.settings.allowannotations) {
            $(widget.object).cotgNoteOnImage();

            // For backwards compatibility see SHARED-46029:
            $('[role=control-wrapper]', widget.object).css("position", "relative");
          }

          // Events
          widget.object.on('clear.cotg', widget.onClear);
          widget.object.on('save-state.cotg', widget.onSaveState);
          widget.object.on('restore-state.cotg', widget.onRestoreState);
        },

        getPicture: function(fromLibrary) {
          // Get the parameters
          var imgWidth;
          var imgHeight;
          if (widget.settings.scaleimage === true && (widget.settings.width || widget.settings.height)) {
            imgWidth = widget.settings.width;
            imgHeight = widget.settings.height;
          }

          var encodingtype;
          var format;
          if (widget.settings.encodingtype === 'png') {
            encodingtype = Camera.EncodingType.PNG;
            format = ".png";
          } else {
            encodingtype = Camera.EncodingType.JPEG
            format = ".jpg";
          }

          var imgQuality = widget.settings.quality;
          var editimage = widget.settings.editimage; // allow iOS users to rotate
          // and crop

          navigator.camera.getPicture(function(data) { // on success
            widget.imageElement.prop('src', data);
            widget.imageElement.show();
            widget.object.addClass('captured');
            widget.imageDataElement.val(data);

            if (widget.clearButton != null) {
              widget.clearButton.show();
            }

            widget.object.trigger('set.cotg');
            widget.imageElement.trigger('bind-to-image.cotg', false);

            // Some debug info
            if (widget.descElement.length) {
              widget.descElement.html('Source: ' + (fromLibrary ? 'library' : 'camera') + ', Format: ' + format
                + ', Quality: ' + imgQuality + '<br />' + 'Width: ' + imgWidth + ' px, Height: '
                + imgHeight + ' px');
            }
          }, function(event) { // on error
            // do nothing is fine
          }, { // options
            sourceType : (fromLibrary ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA),
            allowEdit : editimage,
            targetWidth : imgWidth,
            targetHeight : imgHeight,
            encodingType : encodingtype,
            quality : imgQuality,
            destinationType : Camera.DestinationType.FILE_URI,
            correctOrientation : true
          }
            // Note that on Android, the option saveToAlbum is not
            // supported and allowEdit IS supported, contrary to what
            // what is described
            // in documentation web page.
          );
        },

        onClear: function() {
          widget.clearButton.hide();
          widget.imageElement.prop('src', '');
          widget.imageElement.hide();
          widget.imageDataElement.val('');
          widget.descElement.html('');
          if (widget.settings.allowannotations) {
            // Make sure annotations are cleared, the normal clear.cotg is sent to both but
            // the order is not guaranteed. We must first remove the image and then clear annotations.
            widget.object.trigger('clear-note.cotg');
          }
        },

        onSaveState: function(event, state) {
          if (widget.imageElement.is(':visible')) {
            state[widget.object.attr('id')] = widget.imageElement.prop('src');
          }
        },

        onRestoreState: function(event, state) {
          var imageSource = state[widget.object.attr('id')];
          if (!!imageSource) {
            widget.imageDataElement.val(imageSource);
            widget.imageElement.prop('src', imageSource);
            widget.imageElement.show();
            widget.clearButton.show();
          }
        }
      };
      widget.init(options);
    });
  };
  $.fn.cotgPhotoWidget.defaults = {
    editimage : false,
    encodingtype : 'jpg',
    height: 864,
    width: 1152,
    source: 'takeandpick',
    scaleimage: true,
    quality: 80,
    allowannotations: false
  };

  $.fn.cotgNoteOnImage = function() {
    return this.each(function() {
      var widget = {
        object: $(this),
        imageElement: $('img', this),
        noteElement: $('[role=note]', this),
        noteDataElement: $('[role=note-data]', this),
        clearButton: $('[role=clear-button]', this),
        noteData: null,

        init: function() {
          widget.clearButton.on('click.note-cotg', widget.onClear);
          widget.clearButton.hide();

          widget.object.parents("label").click(function(event) {
            event.preventDefault();
          });

          widget.noteDataElement.html('');
          widget.noteElement.html('');

          widget.bindToImage(false);

          // Events
          widget.object.on('clear.cotg', widget.onClear);

          // To only clear the annotation if it's combined PhotoWidget and NoteOnImage element
          widget.object.on('clear-note.cotg', widget.onClear);

          widget.object.on('save-state.cotg', widget.onSaveState);
          widget.object.on('restore-state.cotg', widget.onRestoreState);

          widget.imageElement.on('bind-to-image.cotg', function(event, redraw) {
            widget.bindToImage(redraw);
          });
        },

        bindToImage: function(redraw) {
          if (!widget.noteDataElement.length) {
            widget.imageElement.after('<input name="' + widget.object.attr('id') + '-note-data" role="note-data" type="hidden">');
            widget.noteDataElement = $('[role=note-data]', widget.object);
          }
          if (!widget.noteElement.length) {
            widget.imageElement.after('<div role="note" style="position: absolute;"></div>');
            widget.noteElement = $('[role=note]', widget.object);
          }

          // Determine the location for the annotation canvas
          // Wait till the images is loaded so we can retrieve the proper position information
          widget.imageElement.one('load', function() {
            widget.initNoteElement(redraw);
          }).each(function() {
            if (this.complete) {
              widget.initNoteElement(redraw);
            }
          });

        },

        initNoteElement: function(redraw) {
          var imgPos = widget.imageElement.position();
          widget.noteElement.css({
            height: widget.imageElement.outerHeight() + "px",
            width: widget.imageElement.outerWidth() + "px",
            left: parseFloat(imgPos.left).toFixed(2) + "px",
            top: parseFloat(imgPos.top).toFixed(2) + "px",
          });

          // Bind the annotation editor to the click event of the note area
          widget.noteElement.off("click.cotg").on("click.cotg", function() {
            widget.annotationEditor();
          });

          if (redraw) {
            widget.draw();
          }

        },

        draw: function() {
          if (!!widget.noteData) {
            widget.noteElement.html('');
            var imgWidth = widget.imageElement.width();
            var imgHeight = widget.imageElement.height();

            if (browserSupportsSvg) {
              widget.noteElement.html(navigator.handDrawTool.getSVG(widget.noteData, imgWidth, imgHeight));
            } else {
              var imgCanvas = document.createElement('canvas');
              imgCanvas.setAttribute('width', imgWidth);
              imgCanvas.setAttribute('height', imgHeight);
              widget.noteElement.append(imgCanvas);
              navigator.handDrawTool.drawInContext(imgCanvas.getContext('2d'), widget.noteData, imgWidth, imgHeight);
            }
          }
        },

        annotationEditor: function() {
          var imgWidth = widget.imageElement.width();
          var imgHeight = widget.imageElement.height();

          navigator.handDrawTool.record(
            // callback
            function(data) {
              widget.noteData = data;
              widget.noteDataElement.val(navigator.handDrawTool.getSVG(data, imgWidth, imgHeight));
              widget.draw();
              widget.clearButton.show();

              widget.object.trigger('set.cotg');
            },
            // options
            {
              mode: 'annotation',
                width: imgWidth,
                height: imgHeight,
                edit: widget.noteData,
                background: widget.imageElement.attr('src')
            }
          );

        },

        onClear: function() {
          widget.noteData = null;
          widget.noteElement.html('');
          widget.noteElement.css('outline', '');
          widget.noteElement.css('height', '0px');
          widget.noteElement.css('width', '0px');
          widget.noteDataElement.val('');
          widget.initNoteElement(false);

          if (widget.clearButton) {
            widget.clearButton.hide();
          }
        },

        onSaveState: function(event, state) {
          state[widget.object.attr('id') + '-annot'] = widget.noteData;
        },

        onRestoreState: function(event, state) {
          widget.noteData = state[widget.object.attr('id') + '-annot'];
          if (!!widget.noteData) {
            document.addEventListener('deviceready', function() {
              widget.bindToImage(true);
              widget.clearButton.show();
            }, false);
          }
        }

      };

      widget.init();
    });
  };

  $.fn.cotgBarcode = function() {
    return this.each(function() {
      var widget = {
        object: $(this),
        dataElement: $('[role=barcode-data]', this),
        scanButton: $('[role=scan-button]', this),

        init: function() {
          widget.scanButton.on('click.cotg', widget.onScan);

          // CUSTOM EVENTS
          widget.object.on('clear.cotg', widget.onClear);
          widget.object.on('scan.cotg', widget.onScan);
        },

        onClear: function() {
          widget.dataElement.val('');
        },

        onScan: function() {
          navigator.barcodeScanner.scan(function(result){
            if (!result.cancelled) {
              delete result.cancelled;
              widget.dataElement.val(JSON.stringify(result));
              widget.object.trigger('set.cotg');
            }
          }, function() {
            that.dataElement.val('Error scanning barcode!');
          });
        },
      };

      widget.init();
    });
  };

  $.fn.cotgUserAccount = function() {
    return this.each(function() {
      var widget = {
        object: $(this),

        init: function() {
          document.addEventListener('deviceready', function() {
            widget.object.val(navigator.cotgHost.loginIdentifier);
            widget.object.trigger('set.cotg');
          });

          // CUSTOM EVENTS
          widget.object.on('clear.cotg', widget.onClear);
        },

        onClear: function() {
          widget.object.val('');
        },
      };

      widget.init();
    });
  };

  $.fn.cotgDeviceInfo = function() {
    return this.each(function() {
      var widget = {
        object: $(this),

        init: function() {
          document.addEventListener('deviceready', function() {
            widget.object.val(JSON.stringify(device));
            widget.object.trigger('set.cotg');
          }, false);

          // CUSTOM EVENTS
          widget.object.on('clear.cotg', widget.onClear);
        },

        onClear: function() {
          widget.object.val('');
        },
      };

      widget.init();
    });
  };

  $.fn.cotgLocale = function() {
    this.each(function() {
      var widget = {
        object: $(this),

        init: function() {
          document.addEventListener('deviceready', function() {
            navigator.globalization.getLocaleName(function(locale) {
              widget.object.val(locale.value);
              widget.object.trigger('set.cotg');
            }, function() {
              widget.object.val('Error getting locale!');
            });
          }, false);

          // CUSTOM EVENTS
          widget.object.on('clear.cotg', widget.onClear);
        },

        onClear: function() {
          widget.object.val('');
        },
      };

      widget.init();
    });

    return this;
  };

  $.fn.cotgUpdateCloneIds = function() {
    return this.each(function() {
      $tableId = $(this).attr('id');
      $("tbody tr", this).each(function(rowIndex) {
        $("label, input, textarea, select, [role^='cotg.']", this).each(function () {
          $(this).cotgAddSuffixToAttr('id', $tableId, rowIndex, false);
          $(this).cotgAddSuffixToAttr('name', $tableId, rowIndex, true);
          $(this).cotgAddSuffixToAttr('for', $tableId, rowIndex, false);
        });
      });
    });
  };

  $.fn.cotgAddSuffixToAttr = function(attr, tableId, rowIdx, useArrayNotation) {
    return this.each(function() {
      var value = $(this).attr(attr);
      if (value != undefined) {
        // When the user deletes a row that isn't that last row
        // the id of the row below is wrong. In that case we first
        // need to remove the suffix we had previously added, before
        // we can apply the correct suffix.
        var regex = useArrayNotation ? /.+\[row_\d+\]\[(.+)\]/i : /.+row_\d+__(.+)_/i;
        var found = value.match(regex);
        if (found != null) {
          value = found[1];
        }
        var newValue = tableId;
        if (useArrayNotation) {
          newValue = newValue + '[row_' + rowIdx + '][' + value + ']';
        } else {
          newValue = newValue + '_row_' + rowIdx + '__' + value + '_';
        }
        $(this).attr(attr, newValue);
      }
    });
  };

  $.fn.cotgAddRow = function(buttonPress) {
    return this.each(function() {
      $table = $(this);
      var $tbody = $table.find('tbody');
      var $newRow = $tbody.children("tr").first().clone();

      $newRow.find('input, textarea').not(':input[type=checkbox]').not(':input[type=radio]').val("");
      $newRow.find('input[type=checkbox]').prop("checked", false);

      $tbody.append($newRow);
      $table.cotgUpdateCloneIds();

      if (buttonPress) {
        $newRow.find('input[type=checkbox][checked], input[type=radio][checked]').prop("checked", true);
        $newRow.find('input[value]').not(':input[type=checkbox]').not(':input[type=radio]').each(function () {
          var value = $(this).attr("value").trim();
          if (value.length > 0) {
            $(this).val(value);
          }
        });
        $newRow.find('textarea').each(function () {
          $(this).val($(this).html());
        });
        $newRow.find('select').each(function() {
          var optionValue = $(this).find('option[selected]').val();
          if (optionValue !== undefined) {
            $(this).val(optionValue);
          }
        });

        var clones = parseInt($table.attr('data-cotg-clones'));
        if (isNaN(clones)) {
          clones = 1;
        } else {
          clones++;
        }
        $table.attr('data-cotg-clones', clones);
      }

      initWidgets($newRow);
    });
  };

  $.fn.cotgDeleteRow = function() {
    return this.each(function() {
      var $table = $(this).closest('table');
      var rowCount = $table.find( "tbody tr").length;
      if (rowCount > 1) {
        $(this).remove();

        var clones = parseInt($table.attr('data-cotg-clones'));
        if (!isNaN(clones)) {
          clones--;
          $table.attr('data-cotg-clones', clones);
        }
        $table.cotgUpdateCloneIds();
      }
    });
  };

  /**
   * Saves the state of all the clones, this includes the number of clones
   * and the value of all input fields for each clone. Typically a clone is a table row.
   *
   * The data-cotg-clones attribute is typically set on the table element which must have an
   * id attribute with a unique value.
   *
   * @param state
   */
  function saveClones(state) {
    $('[data-cotg-clones]').each(function () {
      var numberOfClones = parseInt($(this).attr('data-cotg-clones'));
      if (isNaN(numberOfClones)) {
        return;
      }

      var id = $(this).attr('id');
      if (id == undefined) {
        return;
      }

      if (state['data-cotg-clones'] == undefined) {
        state['data-cotg-clones'] = {};
      }
      state['data-cotg-clones'][id] = { 'numberOfClones' : numberOfClones};

      var values = [];
      $('tbody tr input:not([type=radio]):not([type=checkbox]), tbody tr select, tbody tr textarea', $(this)).each(function () {
        values.push($(this).val());
      });
      state['data-cotg-clones'][id]['values'] = values;

      var checked = [];
      $('tbody tr input[type=checkbox]:checked, tbody tr input[type=radio]:checked', $(this)).each(function () {
        var inputID = $(this).attr('id');
        if (inputID !== undefined) {
          checked.push(inputID);
        }
      });
      state['data-cotg-clones'][id]['checked'] = checked;

    });
  }

  /**
   * Recreates all the clones (table rows), makes sure all the cloned input fields have
   * unique id's names etc. Restores the values for all the input fields.
   *
   * @param state
   */
  function recreateClones(state) {
    var clonesState = state['data-cotg-clones'];
    if (clonesState == undefined)
      return;

    for (var id in clonesState) {
      $('#' + id).attr('data-cotg-clones', clonesState[id].numberOfClones);
    }

    $('[data-cotg-clones]').each(function () {
      var numberOfClones = parseInt($(this).attr('data-cotg-clones'));
      if (isNaN(numberOfClones)) {
        return;
      }

      for (var i = 0 ; i < numberOfClones; i++) {
        $(this).cotgAddRow(false);
      }

      var contextState = state['data-cotg-clones'][$(this).attr('id')];
      $('tbody tr input:not([type=radio]):not([type=checkbox]), tbody tr select, tbody tr textarea', $(this)).each(function (index) {
        $(this).val(contextState.values[index]);
      });

      // Restore checked state for checkboxes and radio buttons based on the stored ids
      for (var i = 0; i < contextState.checked.length; i++) {
        var escapedSelector = "#" + contextState.checked[i].replace(/\[/g, "\\[").replace(/\]/g, "\\]");
        $(escapedSelector).prop("checked", true);
      }
    });
  }

  window.addEventListener('savestate', function(event) {
    saveClones(event.detail.state);
    jQuery('[role^=cotg\\.]').trigger('save-state.cotg', [event.detail.state]);
    window.dispatchEvent(new CustomEvent("olcotgsavestate", {"detail" : event.detail}));
  }, false);

  window.addEventListener('restorestate', function(event) {
    recreateClones(event.detail.state);
    jQuery('[role^=cotg\\.]').trigger('restore-state.cotg', [event.detail.state]);
    window.dispatchEvent(new CustomEvent("olcotgrestorestate", {"detail" : event.detail}));
  }, false);

  function initWidgets($context) {
    $('[role="cotg.Signature"]', $context).cotgSignature();
    $('[role="cotg.DatePicker"]', $context).cotgDatePicker();
    $('[role="cotg.TimePicker"]', $context).cotgTimePicker();
    $('[role="cotg.Geolocation"]', $context).cotgGeolocation();
    $('[role="cotg.PhotoWidget"]', $context).cotgPhotoWidget();
    $('[role="cotg.NoteOnImage"]', $context).cotgNoteOnImage();
    $('[role="cotg.Barcode"]', $context).cotgBarcode();
    $('[role="cotg.UserAccount"]', $context).cotgUserAccount();
    $('[role="cotg.DeviceInfo"]', $context).cotgDeviceInfo();
    $('[role="cotg.Locale"]', $context).cotgLocale();
  }

  $(document).ready(function() {
    initWidgets();

    $("table [role=cotg-add-row-button]").on("click", function(){
      $(this).closest('table').cotgAddRow(true);
    });

    $("table").on("click", "[role=cotg-delete-row-button]", function(){
      $(this).closest('tr').cotgDeleteRow();
    });

    // note table[role=cotg-table] needs to be kept for backwards compatibility SHARED-40369
    $('form table[role="cotg.FieldsTable"], form table[role=cotg-table], form table[data-detail]').each(function() {
      $(this).cotgUpdateCloneIds();
    });
  });

}(jQuery));
