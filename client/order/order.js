/**
 * Created by fanghua on 2015/7/11.
 */
angular.module('mean')
    .controller('orderController', orderController);

function orderController(userService, $http, $timeout, $window) {
    var order = this;
    order.username = '';
    order.password = '';
    order.userService = userService;
    order.showalert = false;
    order.error = false;
    order.item = '';
    order.items = [];
    order.group = '';

    order.register = register;
    order.signin = signin;
    order.signout = signout;
    order.Order = Order;
    order.totalprice = totalprice;
    order.submit = submit;
    order.alerting = alerting;


    function alerting() {
        order.showalert = true;
        console.log(order.showalert);
        $timeout(function () {
            order.showalert = false;
        }, 1500);
    }

    function signout() {
        userService.signout();
    }

    function signin() {
        console.log(order.username, order.password);
        userService
            .signin(order.username, order.password)
            .then(function () {
                order.username = '';
                order.password = '';
                console.log('login success');
                $('#loginModal').modal('hide');
            }, function () {
                order.username = '';
                order.password = '';
                order.error = true;
                console.log('login failure');
            });
    }

    function register() {
        console.log(order.username);
        console.log(order.password);
        userService.register(order.username, order.password).then(function () {
            console.log('username\n' + order.username + '\nregister success!');
            $('#signinModal').modal('hide');
        }, function () {
            order.username = '';
            order.password = '';
            order.error = true;
            console.log('username\n' + order.username + '\nmay already exist!')
        });

    }


    function Order() {
        $http.get('/api/items')
            .success(function (items) {
                console.log(order.items)
                order.items = items;
                console.log(order.items)

            });
    }

    function totalprice() {
        var price = 0;
        var items = order.items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].selected) {
                price = price + items[i].price;
                ;
            }
        }

        return price;
    }


    function submit() {
        console.log(order.items);
        console.log(order.group);

        if (order.totalprice() == 0) {
            alert('请选择订购项目！');
        }
        else {

            $http.post('/pay', {
                username: JSON.parse($window.localStorage.getItem('localUser')).username,
                password: JSON.parse($window.localStorage.getItem('localUser')).password,
                paid: order.items,
                group: order.group
            }).success(function (result) {
                $window.localStorage.setItem('localUser', JSON.stringify(result.value))
                $('#orderModal').modal('hide');
                alert('您已订购成功！共支付' + order.totalprice() + '元!');
            }).error(function () {
                order.error = true;
            });
        }
    }
}