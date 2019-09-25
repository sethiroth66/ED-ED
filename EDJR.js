"use strict";
exports.__esModule = true;
// import {Fileheader} from "./src/events/fileheader";
var EDJR = /** @class */ (function () {
    function EDJR(name) {
        this.listen_events = [
            'Location', 'FSDTarget', 'FSDJump', 'StartJump',
            'Scan',
            'FSSAllBodiesFound', 'FSSDiscoveryScan', 'FSSSignalDiscovered',
            'SAAScanComplete', 'SAASignalsFound'
        ];
        this.system_properties = Object();
        this.system_properties.name = 'Taurus Dark Region EB-X b1-2';
    }
    EDJR.prototype.getSystemDetails = function () {
        return this.system_properties;
    };
    EDJR.prototype.logEvent = function (data) {
        if (this.listen_events.indexOf(data.event) >= 0) {
            this.system_properties._events.push(data);
            return true;
        }
        return false;
    };
    EDJR.prototype.getData = function () {
        return this.system_properties;
    };
    //<editor-fold desc="Event Processes">
    // Location summary when loading game
    EDJR.prototype.Location = function (data) {
        this.system_properties.name = data.StarSystem;
    };
    // Targeted a system to jump to ( pre StartJump )
    EDJR.prototype.FSDTarget = function (data) {
        this.next_system.name = data.Name;
    };
    // Begun jumping to a system (post FSDTarget, pre FSDJump)
    EDJR.prototype.StartJump = function (data) {
        this.next_system.name = data.StarSystem;
        this.next_system.star_type = data.StarClass;
        this.next_system.scoopable = !!"KGBFOAM".indexOf(data.StarClass.toUpperCase());
    };
    // Dropped into a system
    EDJR.prototype.FSDJump = function (data) {
        this.system_properties.name = data.StarSystem;
    };
    EDJR.prototype.Scan = function (data) {
        this.system_properties.name = data.StarSystem;
    };
    EDJR.prototype.FSSAllBodiesFound = function (data) {
        this.system_properties.name = data.StarSystem;
    };
    EDJR.prototype.FSSDiscoveryScan = function (data) {
        this.system_properties.name = data.StarSystem;
    };
    EDJR.prototype.FSSSignalDiscovered = function (data) {
    };
    EDJR.prototype.SAAScanComplete = function (data) {
    };
    EDJR.prototype.SAASignalsFound = function (data) {
    };
    return EDJR;
}());
exports.EDJR = EDJR;
