if (!window.ganttModules) {
	window.ganttModules = {};
}

ganttModules.zoom = (function (gantt) {

	var configs = {
		1: function () {
			gantt.config.scale_unit = "day";
			gantt.config.step = 1;
			gantt.config.date_scale = "%d %M";
			gantt.config.min_column_width = 30;
			gantt.config.subscales = [
				{ unit: "hour", step: 1, date: "%h" }
			];
			gantt.config.round_dnd_dates = true;

			gantt.config.scale_height = 60;
			gantt.templates.date_scale = null;
		},
		2: function () {

			gantt.config.scale_unit = "week";
			gantt.config.date_scale = "%W";
			gantt.config.step = 1;
			gantt.templates.date_scale = null;
			gantt.config.min_column_width = 60;
			gantt.config.subscales = [
				{ unit: "month", step: 1, date: "%M" },
				{ unit: "day", step: 1, date: "%D" }
			];
			gantt.config.round_dnd_dates = true;
			gantt.config.scale_height = 60;
			gantt.templates.date_scale = null;
		},
		3: function () {
			gantt.config.scale_unit = "year";
			gantt.config.date_scale = "%Y";
			gantt.config.min_column_width = 60;
			gantt.config.subscales = [
				{ unit: "month", step: 1, date: "%M" },
				{ unit: "week", step: 1, date: "%W" }
			];
			gantt.config.round_dnd_dates = false;
			gantt.config.scale_height = 60;
			gantt.templates.date_scale = null;
		},
		4: function () {
			gantt.config.scale_unit = "year";
			gantt.config.step = 1;
			gantt.config.date_scale = "%Y";
			gantt.config.min_column_width = 50;
			gantt.config.round_dnd_dates = false;
			gantt.config.scale_height = 60;
			gantt.templates.date_scale = null;


			gantt.config.subscales = [
				{ unit: "month", step: 1, date: "%M" }
			];
		},
		5: function () {
			gantt.config.scale_unit = "year";
			gantt.config.step = 1;
			gantt.config.date_scale = "%Y";
			gantt.config.min_column_width = 50;
			gantt.config.round_dnd_dates = false;
			gantt.config.scale_height = 60;
			gantt.templates.date_scale = null;


			function quarterLabel(date) {
				var month = date.getMonth();
				var q_num;

				if (month >= 9) {
					q_num = 4;
				} else if (month >= 6) {
					q_num = 3;
				} else if (month >= 3) {
					q_num = 2;
				} else {
					q_num = 1;
				}

				return "Q" + q_num;
			}

			gantt.config.subscales = [
				{ unit: "quarter", step: 1, template: quarterLabel },
				{ unit: "month", step: 1, date: "%M" }
			];
		},
		6: function () {
			gantt.config.scale_unit = "year";
			gantt.config.round_dnd_dates = false;
			gantt.config.step = 1;
			gantt.config.date_scale = "%Y";
			gantt.config.min_column_width = 50;

			gantt.config.scale_height = 60;
			gantt.templates.date_scale = null;

			gantt.config.subscales = [];
		}
	}

	var isActive = true;
	var current = 0;

	function setScaleConfig(config) {
		configs[config]();
	}


	function refresh() {
		if (gantt.$container)
			gantt.render();
	}

	return {
		deactivate: function () {
			isActive = false;
		},
		setZoom: function (level) {
			isActive = true;
			current = level;

			setScaleConfig(current);
			refresh();
		},
		zoomOut: function () {
			if (this.canZoomOut()) {
				isActive = true;
				current = (current + 1);
				if (!configs[current])
					current = 6;

				setScaleConfig(current);
				refresh();
			}
		},
		zoomIn: function () {
			if (this.canZoomIn()) {
				isActive = true;
				current = (current - 1);
				if (!configs[current])
					current = 1;
				setScaleConfig(current);
				refresh();
			}
		},
		canZoomOut: function () {
			return !isActive || !!(configs[current + 1]);
		},
		canZoomIn: function () {
			return !isActive || !!(configs[current - 1]);
		}
	};
})(gantt);