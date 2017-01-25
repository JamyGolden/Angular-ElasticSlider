(function(angular){
'use strict';

angular.module('ngElasticSlider', [])
.directive('elasticSlider', ['$timeout', function($timeout){

    // Factory methods
    // ========================================================================
    function _pagiFactory(num, activeSlide) {
        var arr = [];
        activeSlide = activeSlide || 1;

        for (var i = 0; i < num; i++) {
            arr.push({
                index: i,
                isActive: (activeSlide - 1) === i,
                type: 'pagi'
            });
        }

        return arr;
    };

    return {
        restrict: 'E',
        scope: {
            activeSlide: '<',
            enableArrows: '<',
            enablePagination: '<',
            autoPlayDuration: '<',
            animation: '@',
            triggerUpdate: '<', // bool
        },
        transclude: true,
        templateUrl: 'angular-elasticslider.html',
        link: function(scope, element) {

            // Private properties
            // ================================================================
            var _animation = null; // scope.animation
            var _sliderOptions = null; // obj
            var _disablePagi = false;
            var _totalSlides = 0;

            // Private properties
            // ================================================================
            function _constructor(scope, element) {
                _init();

                // One way binding
                scope.$watch('animation', function(newVal, oldVal) {
                    if (newVal && newVal !== oldVal) {
                        _animation = newVal;
                    }
                });

                // Watch for re-compile
                scope.$watch('triggerUpdate', function(newVal, oldVal) {
                    if (newVal === true) {
                        scope.elasticSlider.destroy();
                        _init();
                        scope.triggerUpdate = false;
                    }
                })
            }

            function _init() {
                _animation = scope.animation;
                _sliderOptions = {
                    activeSlide: scope.activeSlide || 1,
                    animation: _animation
                };
                _disablePagi = false;
                _totalSlides = 0;

                // Defer
                // Wait for html to render
                $timeout(function() {
                    var elContainer = element[0]
                        .querySelector('.ElasticSlider-container');

                    _totalSlides = elContainer.children.length;

                    scope.pagiArr = _pagiFactory(_totalSlides, scope.activeSlide);

                    scope.elasticSlider = new ElasticSliderCore(
                        element[0],
                        _sliderOptions
                    );
                }, 100);
            }

            // Public methods
            // ================================================================
            scope.setActive = function(index) {
                // Throttle multiple triggers
                if (_disablePagi === false) {

                    if (index > _totalSlides - 1) {
                        index = 0;
                    } else if (index < 0) {
                        index = _totalSlides - 1;
                    }

                    for (var i = 0; i < scope.pagiArr.length; i++) {
                        // Set active item, remove active
                        scope.pagiArr[i].isActive = false;

                        if (scope.pagiArr[i].index === index) {
                            scope.pagiArr[i].isActive = true;
                        }
                    }

                    scope.elasticSlider.toSlide({
                        index: index,
                        animation: _animation,
                        startAnimationCallback: function(){
                            scope.activeSlide = index + 1;
                            _disablePagi = true;
                        },
                        endAnimationCallback: function(){
                            _disablePagi = false;
                        }
                    });

                }
            }

            scope.toSlide = function(direction) {
                var index = null;

                direction = direction.toLowerCase();
                direction = direction === 'prev' ? direction : 'next';

                if (direction === 'prev'){
                    index = scope.elasticSlider.getProp('activeSlideIndex') -1;

                    scope.elasticSlider.setProp('animationDirection', 'prev');
                } else {
                    index = scope.elasticSlider.getProp('activeSlideIndex') +1;

                    scope.elasticSlider.setProp('animationDirection', 'next');
                }

                scope.setActive(index);
            }

            _constructor(scope, element);
        }
    }
}]);

})(angular);
