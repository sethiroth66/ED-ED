"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EDJR = /** @class */ (function () {
    function EDJR() {
        this.listen_events = [
            'Location', 'FSDTarget', 'FSDJump', 'StartJump',
            'Scan',
            'FSSAllBodiesFound', 'FSSDiscoveryScan', 'FSSSignalDiscovered',
            'SAAScanComplete', 'SAASignalsFound'
        ];
        //</editor-fold>
    }
    EDJR.prototype.LogEvent = function (data) {
        if (this.listen_events.indexOf(data.event) >= 0) {
            this.system_properties._events.push(data);
            return true;
        }
        return false;
    };
    //<editor-fold desc="Event Processes">
    EDJR.prototype.Location = function (data) {
        this.system_properties.name = data.StarSystem;
    };
    EDJR.prototype.FSDTarget = function (data) {
        this.next_system.name = data.Name;
    };
    EDJR.prototype.StartJump = function (data) {
        this.next_system.name = data.StarSystem;
        this.next_system.star_type = data.StarClass;
        this.next_system.scoopable = !!"KGBFOAM".indexOf(data.StarClass.toUpperCase());
    };
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
