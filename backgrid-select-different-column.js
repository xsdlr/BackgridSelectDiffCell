(function(root, factory) {

    // CommonJS
    if (typeof exports == "object") {
        module.exports = factory(root,
            require("underscore"),
            require("backgrid"));
    }
    // Browser
    else factory(root, root._, root.Backgrid);

}(this, function(root, _, Backgrid) {

    "use strict";

    var SelectDiffFormatter = Backgrid.SelectDiffFormatter = function() {};
    SelectDiffFormatter.prototype = new Backgrid.CellFormatter();
    _.extend(SelectDiffFormatter.prototype, {

        fromRaw: function(rawValue, model) {
            var result = {};
            if (_.isObject(rawValue)) {
                if (!_.isArray(rawValue.option) || _.isEmpty(rawValue.option)) {
                    rawValue.option = [];
                }
                if (!_.isArray(rawValue.selected) || _.isEmpty(rawValue.selected)) {
                    rawValue.selected = [];
                };
                result.option = rawValue.option;
                result.selected = rawValue.selected;
            } else {
                result.option = result.selected = [];
            }
            return result;
        }
    });

    var SelectDiffCellEditor = Backgrid.Extension.SelectDiffCellEditor = Backgrid.SelectCellEditor.extend({
        render: function() {
            this.$el.empty();

            var model = this.model;
            var rawData = this.formatter.fromRaw(model.get(this.column.get("name")), model);
            var options = rawData.option;
            var selectedKeys = rawData.selected;

            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                var text = option.value;
                var key = option.key;
                this.$el.append(this.template({
                    text: text,
                    value: key,
                    selected: _.indexOf(selectedKeys, key) > -1
                }));
            }

            this.delegateEvents();
            return this;
        },
        save: function(e) {
            var model = this.model;
            var column = this.column;
            var value = this.$el.val();
            var rawData = this.formatter.fromRaw(model.get(this.column.get("name")), model);

            value = _.isArray(value) ? value : value != null ? [value] : [];
            rawData.selected = value;
            model.set(column.get("name"), this.formatter.toRaw(rawData, model));
        }

    });

    /**
     * 渲染每行不同的选择框
     *
     * @return {Backgrid.Cell}
     */
    Backgrid.Extension.SelectDiffCell = Backgrid.SelectCell.extend({

        /** @property */
        editor: SelectDiffCellEditor,

        /** @property */
        delimiter: ', ',

        /** @property */
        formatter: SelectDiffFormatter,

        /**
           Initializer.

           @param {Object} options
           @param {Backbone.Model} options.model
           @param {Backgrid.Column} options.column

           @throws {TypeError} If `optionsValues` is undefined.
        */
        initialize: function(options) {
            Backgrid.SelectCell.__super__.initialize.apply(this, arguments);
            var _model = this.model.get(this.column.get("name"));
            if (_.isObject(_model)) {
                this.multiple = _model.multiple || this.multiple;
            }
            this.listenTo(this.model, "backgrid:edit", function(model, column, cell, editor) {
                if (column.get("name") == this.column.get("name")) {
                    editor.setOptionValues(this.optionValues);

                    editor.setMultiple(this.multiple);
                }
            });
        },

        render: function() {
            this.$el.empty();

            var model = this.model;
            var rawData = this.formatter.fromRaw(model.get(this.column.get("name")), model);
            var options = rawData.option;
            var selectedKeys = rawData.selected;

            var selectedText = [];
            var isSelected = false;
            for (var k = 0; k < selectedKeys.length; k++) {
                var selectedKey = selectedKeys[k];
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];
                    var text = option.value;
                    var key = option.key;

                    if (key == selectedKey) {
                        selectedText.push(text);
                        isSelected = true;
                    }
                }
                if (!this.multiple && isSelected) {
                    break;
                }
            }
            this.$el.append(selectedText.join(this.delimiter));
            this.delegateEvents();
            return this;
        }
    });
}));
