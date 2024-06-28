'use strict';

var app = angular.module('application', []);

app.controller('AppCtrl', function($scope, appFactory) {
    $("#success_register").hide();
    $("#success_login").hide();
    $("#success_query").hide();
    $("#success_recharge").hide();

    $scope.registerUser = function() {
        $("#success_register").hide();
        appFactory.registerUser($scope.register, function(data) {
            $scope.register_status = "Registration " + data.message;
            $("#success_register").show();
        });
    }

    $scope.loginUser = function() {
        $("#success_login").hide();
        appFactory.loginUser($scope.login, function(data) {
            if (data.status === 'success') {
                window.location.href = '/mainpage.html';
            } else {
                $scope.login_status = "Login failed: " + data.message;
                $("#success_login").show();
            }
        });
    }

    $scope.queryAB = function() {
        appFactory.queryAB(function(data) {
            $scope.user_info = data.data;
            $("#success_query").show();
        });
    }

    $scope.rechargePoints = function() {
        $("#success_recharge").hide();
        appFactory.rechargePoints($scope.recharge, function(data) {
            $scope.recharge_status = data.message;
            $("#success_recharge").show();
            $scope.queryAB(); // 충전 후 잔액 조회
        });
    }

    // 로그인 후 바로 잔액 조회
    $scope.queryAB();
});

app.factory('appFactory', function($http) {
    var factory = {};

    factory.registerUser = function(data, callback) {
        $http.post('/register', data).success(function(output) {
            callback(output);
        });
    }

    factory.loginUser = function(data, callback) {
        $http.post('/login', data).success(function(output) {
            callback(output);
        });
    }

    factory.queryAB = function(callback) {
        $http.get('/query').then(function(response) {
            callback(response.data);
        });
    }

    factory.rechargePoints = function(data, callback) {
        $http.post('/recharge', data).then(function(response) {
            callback(response.data);
        });
    }

    return factory;
});
