'use strict';

var app = angular.module('application', []);

app.controller('AppCtrl', function($scope, appFactory) {
    $("#success_register").hide();
    $("#success_login").hide();
    $("#success_query").hide();
    $("#success_recharge").hide();
    $("#success_transaction").hide();
    $("#success_game").hide();

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
                if (data.isAdmin) {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/mainpage.html';
                }
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

    $scope.sendPoints = function() {
        $("#success_transaction").hide();
        appFactory.sendPoints($scope.transaction, function(data) {
            $scope.transaction_status = data.message;
            $("#success_transaction").show();
            $scope.queryAB(); // 송금 후 잔액 조회
        });
    }
    
    $scope.playGame = function() {
        $("#success_game").hide();
        appFactory.playGame($scope.game, function(data) {
            $scope.game_status = data.message;
            $("#success_game").show();
            $scope.queryAB(); // 게임 후 잔액 조회
        });
    }

    $scope.userRechargePoints = function() {
        $("#success_recharge").hide();
        appFactory.userRechargePoints($scope.recharge, function(data) {
            $scope.recharge_status = data.message;
            $("#success_recharge").show();
            $scope.queryAB(); // 충전 후 잔액 조회
        });
    }

    $scope.logout = function() {
        appFactory.logout(function() {
            window.location.href = '/login.html';
        });
    }

    // 로그인 후 바로 잔액 조회
    $scope.queryAB();
});

app.controller('AdminCtrl', function($scope, appFactory) {
    $("#success_recharge").hide();

    $scope.rechargePoints = function() {
        $("#success_recharge").hide();
        appFactory.rechargePoints($scope.recharge, function(data) {
            $scope.recharge_status = data.message;
            $("#success_recharge").show();
        });
    }

    $scope.logout = function() {
        appFactory.logout(function() {
            window.location.href = '/login.html';
        });
    }
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

    factory.sendPoints = function(data, callback) {
        $http.post('/send', data).then(function(response) {
            callback(response.data);
        });
    }

    factory.playGame = function(data, callback) {
        $http.post('/playGame', data).then(function(response) {
            callback(response.data);
        });
    }

    factory.rechargePoints = function(data, callback) {
        $http.post('/admin/recharge', data).then(function(response) {
            callback(response.data);
        });
    }

    factory.userRechargePoints = function(data, callback) {
        $http.post('/recharge', data).then(function(response) {
            callback(response.data);
        });
    }

    factory.logout = function(callback) {
        $http.get('/logout').then(function(response) {
            callback();
        });
    }

    return factory;
});
