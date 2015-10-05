(function(angular){
'use strict';

angular.module('ngElasticSlider', [])
.directive('elasticSlider', function(){

    // Factory methods
    // ========================================================================
    function _pagiFactory(num, activeSlide) {
        var arr = [];
        activeSlide = activeSlide || 1;

        for (let i = 0; i < num; i++) {
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
            activeSlide: '=',
            enableArrows: '=',
            enablePagination: '=',
            autoPlayDuration: '=',
            animation: '@',
        },
        transclude: true,
        templateUrl: 'angular-elasticslider.html',
        link: function(scope, element) {

            // Private properties
            // ================================================================
            var _animation = scope.animation;
            var _sliderOptions = {
                activeSlide: scope.activeSlide || 1,
                animation: _animation
            };
            var _disablePagi = false;
            var _totalSlides = 0;

            // Private properties
            // ================================================================
            function _constructor(scope, element) {
                var elContainer = element[0]
                    .querySelector('.ElasticSlider-container');

                _totalSlides = elContainer.children.length;

                scope.elasticSlider = new ElasticSlider(
                    element[0],
                    _sliderOptions
                );
                scope.pagiArr = _pagiFactory(_totalSlides, scope.activeSlide);

                // One way binding
                scope.$watch('animation', function(newVal, oldVal) {
                    if (newVal && newVal !== oldVal) {
                        _animation = newVal;
                    }
                })
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

                    scope.elasticSlider.setProp('animationDirection', 'Prev');
                } else {
                    index = scope.elasticSlider.getProp('activeSlideIndex') +1;

                    scope.elasticSlider.setProp('animationDirection', 'Next');
                }

                scope.setActive(index);
            },

            _constructor(scope, element);
        }
    }
})

})(angular);
