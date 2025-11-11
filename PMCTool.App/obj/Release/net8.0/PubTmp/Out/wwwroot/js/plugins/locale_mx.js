/*
@license

dhtmlxGantt v.6.1.7 Professional
This software is covered by DHTMLX Enterprise License. Usage without proper license is prohibited.

(c) Dinamenta, UAB.

*/
Gantt.plugin(function (e)
{
    !function (e, t) {
        if ("object" == typeof exports && "object" == typeof module) module.exports = t();
        else if ("function" == typeof define && define.amd) define([], t);
        else {
            var n = t();
            for (var o in n) ("object" == typeof exports ? exports : e)[o] = n[o]
        }
    }
        (window, function () {
            return function (e) {
                var t = {}
                    ;
                function n(o) {
                    if (t[o]) return t[o].exports;
                    var r = t[o] = {
                        i: o, l: !1, exports: {}
                    }
                        ;
                    return e[o].call(r.exports, r, r.exports, n), r.l = !0, r.exports
                }
                return n.m = e, n.c = t, n.d = function (e, t, o) {
                    n.o(e, t) || Object.defineProperty(e, t, {
                        enumerable: !0, get: o
                    }
                    )
                }
                    , n.r = function (e) {
                        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                            value: "Module"
                        }
                        ), Object.defineProperty(e, "__esModule", {
                            value: !0
                        }
                        )
                    }
                    , n.t = function (e, t) {
                        if (1 & t && (e = n(e)), 8 & t) return e;
                        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
                        var o = Object.create(null);
                        if (n.r(o), Object.defineProperty(o, "default", {
                            enumerable: !0, value: e
                        }
                        ), 2 & t && "string" != typeof e) for (var r in e) n.d(o, r, function (t) {
                            return e[t]
                        }
                            .bind(null, r));
                        return o
                    }
                    , n.n = function (e) {
                        var t = e && e.__esModule ? function () {
                            return e.default
                        }
                            : function () {
                                return e
                            }
                            ;
                        return n.d(t, "a", t), t
                    }
                    , n.o = function (e, t) {
                        return Object.prototype.hasOwnProperty.call(e, t)
                    }
                    , n.p = "/codebase/", n(n.s = 211)
            }
                ({
                    211: function (t, n) {
                        e.locale = {
                            date: {
                                month_full: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], month_short: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"], day_full: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"], day_short: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
                            }
                            , labels: {
                                new_task: "Nueva tarea", icon_save: "Guardar", icon_cancel: "Cancelar", icon_details: "Detalles", icon_edit: "Editar", icon_delete: "Eliminar", confirm_closing: "", confirm_deleting: "La tarea se eliminar&aacute; permanentemente, &iquest;Est&aacute;s seguro?", section_description: "Descripci&oacute;n", section_time: "Periodo de tiempo", section_type: "Tipo", section_weight: "Peso", section_realProgress: "Progreso", column_wbs: "WBS", column_text: "Tarea", column_start_date: "Fecha inicio", column_status: "Estado", column_duration: "Duraci&oacute;n", column_add: "", link: "Enlace", confirm_link_deleting: "ser&aacute; eliminado", link_start: " (inicio)", link_end: " (fin)", type_task: "Tarea", type_project: "Proyecto", type_milestone: "Hito", minutes: "Minutos", hours: "Horas", days: "D&iacute;as", weeks: "Semana", months: "Meses", years: "Años", message_ok: "OK", message_cancel: "Cancelar", section_constraint: "Restricci&oacute;n", constraint_type: "Tipo de restricci&oacute;n", constraint_date: "Fecha de restricci&oacute;n", asap: "Tan pronto como sea posible", alap: "Lo m&aacute;s tarde posible", snet: "No comience antes de", snlt: "Comience a m&aacute;s tardar el", fnet: "Finalizar no antes de", fnlt: "Terminar a m&aacute;s tardar el", mso: "Debe comenzar en", mfo: "Debe terminar en", resources_filter_placeholder: "escriba para filtrar", resources_filter_label: "ocultar vac&iacute;o", column_end_date: "Fecha fin", column_realProgress: "Progreso", column_plannedProgress: "Progreso planeado", column_owner: "Responsable", task_status_not_started: "No iniciada", task_status_completed: "Completada", link_lag: "Posposici&oacute;n", link_fs: "T&eacute;rmino - Inicio", link_ff: "T&eacute;rmino - T&eacute;rmino", link_ss: "Inicio - Inicio", link_sf: "Inicio - T&eacute;rmino"
                            }
                        }
                    }
                })
        })
});
//# sourceMappingURL=locale.js.map