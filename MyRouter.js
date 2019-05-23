jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.declare("sap.ui.demo.app.MyRouter");

sap.ui.core.routing.Router.extend("sap.ui.demo.app.MyRouter", {
	onInit:function(){   
            var _this = this;
            var data = [{name : "name"}];
            var oModel = new JSONModel(data); // Only set data here.
            sap.ui.getCore().setModel(oModel,"oModel")
        },

	constructor : function() {
		sap.ui.core.routing.Router.apply(this, arguments);
		this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this);
	},

	myNavBack : function(sRoute, mData) {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sPreviousHash = oHistory.getPreviousHash();

		// The history contains a previous entry
		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			var bReplace = true; // otherwise we go backwards with a forward history
			this.navTo(sRoute, mData, bReplace);
		}
	},

	myNavToWithoutHash : function (oOptions) {
		var oSplitApp = this._findSplitApp(oOptions.currentView);

		// Load view, add it to the page aggregation, and navigate to it
		var oView = this.getView(oOptions.targetViewName, oOptions.targetViewType);
		oSplitApp.addPage(oView, oOptions.isMaster);
		oSplitApp.to(oView.getId(), oOptions.transition || "show", oOptions.data);
	},

	backWithoutHash : function (oCurrentView, bIsMaster) {
		var sBackMethod = bIsMaster ? "backMaster" : "backDetail";
		this._findSplitApp(oCurrentView)[sBackMethod]();
	},
	
	destroy : function() {
		sap.ui.core.routing.Router.prototype.destroy.apply(this, arguments);
		this._oRouteMatchedHandler.destroy();
	},

	_findSplitApp : function(oControl) {
		sAncestorControlName = "idAppControl";

		if (oControl instanceof sap.ui.core.mvc.View && oControl.byId(sAncestorControlName)) {
			return oControl.byId(sAncestorControlName);
		}

		return oControl.getParent() ? this._findSplitApp(oControl.getParent(), sAncestorControlName) : null;
	}

});