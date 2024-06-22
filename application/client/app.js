'use strict';

var app = angular.module('application', []);

app.controller('AppCtrl', function($scope, appFactory){
   $("#success_init").hide();
   $("#success_invoke").hide();
   $("#success_qurey").hide();
   $("#success_qurey_admin").hide();
   $("#success_delete").hide();
   $scope.initAB = function(){
   $("#success_init").hide();
       appFactory.initAB($scope.abstore, function(data){
           if(data == "")
           $scope.init_ab = "success";
           $("#success_init").show();
       });
   }
   $scope.invokeAB = () => {
       $("#success_invoke").hide();
       appFactory.invokeAB($scope.invoke, function(data){
           if(data == "")
           $scope.invoke_ab = "success";
           $("#success_invoke").show();
       });
   }
   $scope.queryAB = function(){
       $("#success_qurey").hide();
       appFactory.queryAB($scope.walletid, function(data){
           $scope.query_ab = data;
           $("#success_qurey").show();
       });
   }
   $scope.queryAdmin = () => {
       $("#success_qurey_admin").hide();
       appFactory.queryAB("admin", function(data){
           $scope.query_admin = data;
           $("#success_qurey_admin").show();
       });
   }
   $scope.deleteAB = () => {
        $("#success_delete").hide();
        appFactory.deleteAB($scope.deleteid, (data) => {
            if(data == "")
            $scope.delete_ab = "success";
            $("#success_delete").show();
        });
    }
});
app.factory('appFactory', function($http){
      
    var factory = {};
 
    factory.initAB = function(data, callback){
        $http.get('/init?user='+data.a+'&userVal='+data.aval).success(function(output){
            callback(output)
        });
    }
    factory.invokeAB = (data, callback) => {
        $http.get('/invoke?sender='+data.sender+'&receiver='+data.receiver+'&amount='+data.amount).success(function(output){
            callback(output)
        });
    }
    factory.queryAB = function(name, callback){
        $http.get('/query?name='+name).success(function(output){
            callback(output)
        });
    }
    factory.deleteAB = (name, callback) => {
        $http.get('/delete?name='+name).success(function(output){
            callback(output)
        });
    }
    return factory;
 });
 