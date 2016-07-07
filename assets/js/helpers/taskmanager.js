'use strict';

const eventhandler  = require('./eventhandler.js');
const request       = require('./request.js');
const forIn         = require('lodash/forIn');
const merge         = require('lodash/merge');

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

module.exports = {
    runNextTask: function(taskPopupOptions) {
        return request.createRequest('/api/v1/tasks/run')
            .then(function(response) {
                if ('OK' === response.body.status) {

                    var taskOptions = merge(
                        {},
                        taskPopupOptions,
                        {taskId: response.body.task.id}
                    );

                    eventhandler.emit('displayTaskPopup', taskOptions);
                }

                return response;
            })
            .catch(function (err) {
                // @todo
            });
    },

    addTask: function(task) {
        return request.createRequest('/api/v1/tasks', {
            method: 'POST',
            json: task
        });
    },

    deleteTask: function(taskId) {
        return request.createRequest('/api/v1/tasks/' + taskId, {
            method: 'DELETE'
        });
    },

    getTask: function(taskId) {
        return request.createRequest('/api/v1/tasks/' + taskId)
    },

    getTaskList: function() {
        return request.createRequest('/api/v1/tasks');
    },

    deleteOrphanTasks: function() {
        // Delete tasks older than a week
        var now = new Date();
        var self = this;

        this.getTaskList()
            .then(function(response) {
                if ('OK' === response.body.status) {
                    forIn(response.body.tasks, function(data, taskId) {
                        var createdAt = Date.parse(data['created_at']);
                        var compare = addDays(createdAt, 7);

                        if (compare < now) {
                            self.deleteTask(taskId);
                        }
                    });
                }

                return response;
            })
            .catch(function() {
                // noop
            });
    }
};