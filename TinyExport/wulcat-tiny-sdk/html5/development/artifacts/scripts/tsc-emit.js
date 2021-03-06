var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var app;
(function (app) {
    var Communication = /** @class */ (function () {
        function Communication() {
        }
        Communication.getMobileOperatingSystem = function () {
            var userAgent = navigator.userAgent || navigator.vendor; //|| window.opera;
            // Windows Phone must come first because its UA also contains "Android"
            if (/windows phone/i.test(userAgent)) {
                return "Windows Phone";
            }
            else if (/android/i.test(userAgent)) {
                return "Android";
            }
            else if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
                return "iOS";
            }
            // // iOS detection from: http://stackoverflow.com/a/9039885/177710
            // if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            //     return "iOS";
            // }
            return "unknown";
        };
        Communication.createFunc = function (func) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            var createCall = func + "(";
            for (var i = 0; i < data.length; i++) {
                if (i != 0)
                    createCall += ",";
                createCall += "data[" + i + "]";
            }
            createCall += ")";
            return createCall;
        };
        Communication.sendMessage = function (func) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            var createCall = "";
            switch (this.getMobileOperatingSystem()) {
                case "Android":
                    func += "Android";
                    createCall = this.createFunc.apply(this, [func].concat(data));
                    eval(createCall);
                    break;
                case "iOS":
                    func += "iOS";
                    createCall = this.createFunc.apply(this, [func].concat(data));
                    eval(createCall);
                    break;
                default:
                    console.warn("%c No Cross Communication Allowed", 'background: #ffcc00; color: #ffffff');
                    break;
            }
        };
        return Communication;
    }());
    app.Communication = Communication;
})(app || (app = {}));
var game;
(function (game) {
    var ButtonSystem = /** @class */ (function (_super) {
        __extends(ButtonSystem, _super);
        function ButtonSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ButtonSystem.prototype.OnUpdate = function () {
            var _this = this;
            if (game.Service.isPaused)
                return;
            var config = game.Service.getConfig(this.world);
            // Start Game
            this.world.forEach([game.StartTag, ut.UIControls.MouseInteraction], function (tag, interaction) {
                if (interaction.clicked) {
                    if (config.loaded) {
                        ut.EntityGroup.destroyAll(_this.world, "game.OnStartGroup");
                        // Set game to interactable
                        config.playable = true;
                        config.uiState = game.GameUIStateEnum.tutorial;
                        console.log("%c Tutorial Screen", 'background: #33ccff; color: #ffffff');
                    }
                }
            });
            // Restart Game
            this.world.forEach([game.RestartTag, ut.UIControls.MouseInteraction], function (tag, interaction) {
                if (interaction.clicked) {
                    config.init = false;
                    config.playable = true;
                    var playableUpdateLoop_1 = function () {
                        config = game.Service.getConfig(this.world);
                        if (config.init) {
                            config.playable = true;
                            config.uiState = game.GameUIStateEnum.tutorial;
                            console.log("%c Tutorial Screen", 'background: #33ccff; color: #ffffff');
                            game.Service.setConfig(config);
                        }
                        else
                            setTimeout(playableUpdateLoop_1, 10);
                    }.bind(_this);
                    setTimeout(playableUpdateLoop_1, 400);
                }
            });
            // Finish Game
            this.world.forEach([game.CloseTag, ut.UIControls.MouseInteraction], function (tag, interaction) {
                if (interaction.clicked) {
                    // Kill the game
                    app.Communication.sendMessage("onQuit");
                }
            });
            // Start the game after intial demo for how to play
            if (config.init && !config.active && config.playable) {
                if (ut.Core2D.Input.isTouchSupported() && ut.Core2D.Input.touchCount() > 0) {
                    var touch = ut.Core2D.Input.getTouch(0);
                    switch (touch.phase) {
                        case ut.Core2D.TouchState.Began:
                            this.Start(config);
                            break;
                    }
                }
                else if (ut.Core2D.Input.getMouseButtonDown(0)) {
                    this.Start(config);
                }
            }
            game.Service.setConfig(config);
        };
        ButtonSystem.prototype.Start = function (config) {
            config.active = true;
            config.uiState = game.GameUIStateEnum.NONE;
            console.log("%c Empty Screen", 'background: #33ccff; color: #ffffff');
            ut.EntityGroup.destroyAll(this.world, "game.GameDemoGroup");
        };
        return ButtonSystem;
    }(ut.ComponentSystem));
    game.ButtonSystem = ButtonSystem;
})(game || (game = {}));
// namespace game {
//     // NOTE: Work in progress
//     export class CameraFollow extends ut.ComponentSystem {
//         OnUpdate() : void {
// if(game.Service.isPaused) return
//             this.world.forEach([game.CameraTag , ut.Entity , game.CameraFollowData , ut.Core2D.TransformLocalPosition] , (tag , entity , data , position)=>{
//                 let targetPosition = this.world.getComponentData(data.target , ut.Core2D.TransformLocalPosition).position
//                 // NOTE: SOMETHING ELSE WAS ALSO CONTANSTATNLY SETTING THE VALUE IN OTHER FRAME TO PLAYERS POSITION
//                 // damm this added a eruption effect on camera
//                 // position.position = new Vector3(targetPosition.x + data.bound.width, targetPosition.y + data.bound.height)
//                 position.position = position.position.lerp(new Vector3(targetPosition.x + data.bound.width , position.position.y) , ut.Time.deltaTime * data.followSpeed)
//                 data.followSpeed += ut.Time.deltaTime / 10
//             })
//         }
//     }
// }
var game;
(function (game) {
    /**
     * Adjust screen layout to fit any aspect ratio. // try running this only once to increase performance
     */
    var FitScreenLayoutSystem = /** @class */ (function (_super) {
        __extends(FitScreenLayoutSystem, _super);
        function FitScreenLayoutSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FitScreenLayoutSystem.prototype.OnUpdate = function () {
            var _this = this;
            if (game.Service.isPaused)
                return;
            var displayInfo = this.world.getConfigData(ut.Core2D.DisplayInfo);
            var aspectRatio = displayInfo.height / displayInfo.width;
            var referenceRatio = 16 / 9;
            var isTallDisplay = aspectRatio > referenceRatio + 0.01;
            var matchWidthOrHeight = isTallDisplay ? 0 : 1;
            // If resolution is taller than 9/16, make UI canvas match the width.
            this.world.forEach([game.CanvasResolutionFitter, ut.UILayout.UICanvas], function (resolutionFitter, canvas) {
                canvas.matchWidthOrHeight = matchWidthOrHeight;
                var referenceHalfSize = 200;
                var halfVerticalSize = isTallDisplay ? aspectRatio * referenceHalfSize / referenceRatio : referenceHalfSize;
                var camera = _this.world.getComponentData(canvas.camera, ut.Core2D.Camera2D);
                camera.halfVerticalSize = halfVerticalSize;
            });
            // If resolution is taller than 9/16, zoom out the camera.
            this.world.forEach([game.CameraResolutionFitter, ut.Core2D.Camera2D], function (resolutionFitter, camera) {
                if (resolutionFitter.DefaultHalfVerticalSize == 0) {
                    resolutionFitter.DefaultHalfVerticalSize = camera.halfVerticalSize;
                }
                var referenceHalfSize = resolutionFitter.DefaultHalfVerticalSize;
                var halfVerticalSize = isTallDisplay ? aspectRatio * referenceHalfSize / referenceRatio : referenceHalfSize;
                camera.halfVerticalSize = halfVerticalSize;
            });
        };
        return FitScreenLayoutSystem;
    }(ut.ComponentSystem));
    game.FitScreenLayoutSystem = FitScreenLayoutSystem;
})(game || (game = {}));
// namespace game {
//     // Re
//     @ut.executeAfter(ut.Shared.UserCodeEnd)
//     export class ParallaxObjectPoolingBehaviourFilter extends ut.EntityFilter {
//         tag : game.ParallaxTag
//         entity : ut.Entity
//         parallaxObjectPooling : game.ParallaxObjectPooling
//     }
//     export class ParallaxObjectPoolingBehaviour extends ut.ComponentBehaviour {
//         data : ParallaxObjectPoolingBehaviourFilter
//         OnEntityUpdate() : void {
// if(game.Service.isPaused) return
//             let target = this.data.parallaxObjectPooling.cameraEntity ,
//                 bounds = app.Service.TransformService.getScreenToWorldRect(this.world , target)
//             let poolingEntities = this.data.parallaxObjectPooling.poolingEntities ,
//                 poolingEntityCount = poolingEntities.length
//             let poolingEntity = poolingEntities[0] , 
//                 size = this.world.getComponentData(poolingEntity , ut.Physics2D.BoxCollider2D).size ,
//                 poolingEntityPosition = this.world.getComponentData(poolingEntity , ut.Core2D.TransformLocalPosition) ,
//                 poolingEntityLocalPosition = poolingEntityPosition.position
//             if(bounds.x - bounds.width > poolingEntityLocalPosition.x) {
//                 let lastpoolingEntityPosition = this.world.getComponentData(poolingEntities[poolingEntityCount-1] , ut.Core2D.TransformLocalPosition)
//                 this.data.parallaxObjectPooling.poolingEntities.shift()
//                 this.data.parallaxObjectPooling.poolingEntities.push(poolingEntity)
//                 poolingEntityLocalPosition = new Vector3(lastpoolingEntityPosition.position.x + size.x + app.Mathf.getRandomFloat(2,4) , poolingEntityLocalPosition.y)
//                 poolingEntityPosition.position = poolingEntityLocalPosition
//                 this.world.setComponentData(poolingEntity , poolingEntityPosition)
//             }
//             this.world.setComponentData(this.data.entity , this.data.parallaxObjectPooling)
//         }
//     }
// }
// namespace game {
//     @ut.executeAfter(ut.Shared.UserCodeEnd)
//     export class ParallaxPoolingBehaviourFilter extends ut.EntityFilter {
//         tag : game.ParallaxTag
//         parallaxPooling : game.ParallaxPooling
//     }
//     export class ParallaxPoolingBehaviour extends ut.ComponentBehaviour {
//         data : ParallaxPoolingBehaviourFilter
//         OnEntityUpdate() : void {
// if(game.Service.isPaused) return
//             // Get Camera
//             let cameraEntity = this.data.parallaxPooling.cameraEntity ,
//                 cameraPosition = this.world.getComponentData(cameraEntity , ut.Core2D.TransformLocalPosition)
//             // Get List Pooling Entities
//             let poolingEntities = this.data.parallaxPooling.poolingEntities ,
//                 poolingObjectCount = poolingEntities.length
//             for(let i = 0 ; i < poolingObjectCount ; i++) {
//                 let poolingEntity = poolingEntities[i] ,
//                     poolingPosition = this.world.getComponentData(poolingEntity , ut.Core2D.TransformLocalPosition) ,
//                     size = this.world.getComponentData(poolingEntity , ut.Core2D.Sprite2DRendererOptions).size
//                 // if the pooling object behind the camera on left
//                 let diffX = Math.abs(poolingPosition.position.x - cameraPosition.position.x)
//                 let diffY = Math.abs(poolingPosition.position.y - cameraPosition.position.y)
//                 // distance between camera and pooling entity is greate than the size of the pooling sprite image
//                 if(this.data.parallaxPooling.horizontalParallax)
//                     if(diffX > size.x) {
//                         // if it is behind shift ahead
//                         if(poolingPosition.position.x < cameraPosition.position.x) {
//                             let position = new Vector3(3*size.x+poolingPosition.position.x , poolingPosition.position.y + 0.01)
//                             poolingPosition.position = position
//                         }
//                         // if it is ahead shift behind
//                         if(poolingPosition.position.x - size.x > cameraPosition.position.x) {
//                             let position = new Vector3(-3*size.x+poolingPosition.position.x , poolingPosition.position.y - 0.01)
//                             poolingPosition.position = position
//                         }
//                     }
//                 if(this.data.parallaxPooling.verticalParallax)
//                     if(diffY > size.y) {
//                         // if it is below shift top
//                         if(poolingPosition.position.y < cameraPosition.position.y) {
//                             let position = new Vector3(poolingPosition.position.x , 3*size.y+poolingPosition.position.y)
//                             poolingPosition.position = position
//                         }
//                         // if it is above shift bottom
//                         if(poolingPosition.position.y - size.y > cameraPosition.position.y) {
//                             let position = new Vector3(poolingPosition.position.x , -3*size.y+poolingPosition.position.y)
//                             poolingPosition.position = position
//                         }
//                     }
//                 // Set the values
//                 this.world.setComponentData(poolingEntity , poolingPosition)
//             }
//         }
//     }
// }
// namespace game {
//     /**
//      * Update the screen transition animation played between game state changes.
//      */
//     @ut.executeAfter(ut.Shared.UserCodeEnd)
//     @ut.executeBefore(ut.Shared.RenderingFence)
//     export class UpdateScreenTransition extends ut.ComponentSystem {
//         OnUpdate():void {
// if(game.Service.isPaused) return
//             let deltaTime = this.scheduler.deltaTime();
//             let entitiesToDestroy: ut.Entity[] = [];
//             this.world.forEach([ut.Entity, game.ScreenTransition], (entity, screenTransition) => {
//                     if (!screenTransition.IsTransitionIn && screenTransition.Timer >= screenTransition.OutDuration) {
//                         screenTransition.Timer = 0;
//                         screenTransition.IsTransitionIn = true;
//                         // GameStateLoadingService.setGameState(this.world, screenTransition.TransitionToState);
//                     }
//                     screenTransition.Timer += deltaTime;
//                     if (screenTransition.IsTransitionIn && screenTransition.SkipFrameCount < 6) {
//                         screenTransition.Timer = 0;
//                         screenTransition.SkipFrameCount++;
//                     }
//                     let duration = screenTransition.IsTransitionIn ? screenTransition.InDuration : screenTransition.OutDuration;
//                     let progress = Math.min(1, Math.max(0,screenTransition.Timer / duration));
//                     if (screenTransition.IsTransitionIn) {
//                         progress = 1 - progress;
//                     }
//                     // Destroy screen transition when it's done.
//                     if (screenTransition.IsTransitionIn && screenTransition.Timer >= screenTransition.InDuration) {
//                         let entityToDestroy = new ut.Entity();
//                         entityToDestroy.version = entity.version;
//                         entityToDestroy.index = entity.index;
//                         entitiesToDestroy.push(entityToDestroy);
//                     }
//                     if (screenTransition.IsScaleHoleTransition) {
//                         // Update scaled hole transition animation.
//                         let scaleHoleRectTransform = this.world.getComponentData(screenTransition.ScaleHole, ut.UILayout.RectTransform);
//                         let size = 2000 * (1 - ut.Interpolation.InterpolationService.evaluateCurveFloat(this.world, progress, screenTransition.ScaleHoleCurve));
//                         scaleHoleRectTransform.sizeDelta = new Vector2(size, size);
//                         this.world.setComponentData(screenTransition.ScaleHole, scaleHoleRectTransform);
//                     }
//                     else {
//                         // Update fade transition animation.
//                         let curtainSpriteRenderer = this.world.getComponentData(screenTransition.BlackCurtain, ut.Core2D.Sprite2DRenderer);
//                         curtainSpriteRenderer.color.a = progress;
//                         this.world.setComponentData(screenTransition.BlackCurtain, curtainSpriteRenderer);
//                     }
//                 });
//             // TODO: Replace destroyAllEntityGroups by foreach loop on entitiesToDestroy.
//             if (entitiesToDestroy.length > 0) {
//                 ut.EntityGroup.destroyAll(this.world, "game.ScreenTransition");
//             }
//         }
//     }
// }
var app;
(function (app) {
    var Geometry;
    (function (Geometry) {
        var Rect = /** @class */ (function () {
            function Rect(x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            }
            Object.defineProperty(Rect.prototype, "min", {
                get: function () {
                    return new Vector2(this.x - this.width / 2, this.y - this.height / 2);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Rect.prototype, "max", {
                get: function () {
                    return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
                },
                enumerable: true,
                configurable: true
            });
            return Rect;
        }());
        Geometry.Rect = Rect;
    })(Geometry = app.Geometry || (app.Geometry = {}));
})(app || (app = {}));
var app;
(function (app) {
    var Mathf = /** @class */ (function () {
        function Mathf() {
        }
        Mathf.checkFloat = function (x, y, delta) {
            if (delta === void 0) { delta = 1e-10; }
            return Math.abs(x - y) < delta;
        };
        Mathf.getRandomFloat = function (min, max) {
            return Math.random() * (max - min) + min;
        };
        Mathf.getRandomInt = function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
        };
        // Shuffling alogrithm => Durstenfeld shuffle : Fisher-Yates
        Mathf.shuffleArray = function (array) {
            var _a;
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
            }
            return array;
        };
        Mathf.toEulerAngle = function (q) {
            var roll = 0, pitch = 0, yaw = 0;
            // roll (x-axis rotation)
            var sinr_cosp = +2.0 * (q.w * q.x + q.y * q.z);
            var cosr_cosp = +1.0 - 2.0 * (q.x * q.x + q.y * q.y);
            roll = Math.atan2(sinr_cosp, cosr_cosp);
            // pitch (y-axis rotation)
            var sinp = +2.0 * (q.w * q.y - q.z * q.x);
            if (Math.abs(sinp) >= 1)
                pitch = Math.PI / 2 * this.getSign(sinp); // use 90 degrees if out of range
            else
                pitch = Math.asin(sinp);
            // yaw (z-axis rotation)
            var siny_cosp = +2.0 * (q.w * q.z + q.x * q.y);
            var cosy_cosp = +1.0 - 2.0 * (q.y * q.y + q.z * q.z);
            yaw = Math.atan2(siny_cosp, cosy_cosp);
            return new Vector3(roll, pitch, yaw);
        };
        Mathf.getSign = function (x) {
            return Math.abs(x) / x;
        };
        Mathf.lookAt2D = function (target, origin) {
            var diff = origin.sub(target);
            diff = diff.normalize();
            var rotationZ = Math.atan2(diff.y, diff.x);
            return new Quaternion().setFromEuler(new Euler(0, 0, rotationZ - Math.PI / 2));
            // -Math.atan2(localPosition.y, localPosition.x) + Math.atan2(mousePosition.y, mousePosition.x)
        };
        Mathf.magnitude = function (vec) {
            return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2));
        };
        Mathf.angleBetween = function (vec1, vec2) {
            return Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
        };
        Mathf.dot = function (a, b) {
            return a.x * b.x + a.y * b.y;
        };
        Mathf.direction = function (a, b) {
            return new Vector3(a.x - b.x, a.y - b.y).normalize();
        };
        Mathf.crossProduct = function (a, b) {
            return new Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
        };
        return Mathf;
    }());
    app.Mathf = Mathf;
})(app || (app = {}));
// namespace game {
//     export class CustomPhysics2DFilter extends ut.EntityFilter {
//         rigidbody : game.CustomRigidbody2D
//         position : ut.Core2D.TransformLocalPosition
//         rotation : ut.Core2D.TransformLocalRotation
//     }
//     export class CustomPhysics2DBehaviour extends ut.ComponentBehaviour {
//         data : CustomPhysics2DFilter
//         OnEntityUpdate() :void {
// if(game.Service.isPaused) return
//             let localPosition = this.data.position.position
//             let rigidbody = this.data.rigidbody ,
//                 localVelocity = rigidbody.velocity
//             // Add Gravity
//             localVelocity.y += rigidbody.gravity * ut.Time.deltaTime
//             // Apply the Velocity
//             this.data.position.position = localPosition.add(localVelocity)
//             // Appy Mass value & Reset the Velocity after reaching certain Epsilon Point
//             if(localVelocity.x > 0) {
//                 localVelocity.x -= ut.Time.deltaTime * rigidbody.mass * ut.Time.deltaTime
//                 if(localVelocity.x < 0) localVelocity.x = 0
//             }
//             else if(localVelocity.x < 0) {
//                 localVelocity.x += ut.Time.deltaTime * rigidbody.mass * ut.Time.deltaTime
//                 if(localVelocity.x > 0) localVelocity.x = 0
//             }
//             if(localVelocity.y > 0) {
//                 localVelocity.y -= ut.Time.deltaTime * rigidbody.mass * ut.Time.deltaTime
//                 if(localVelocity.y < 0) localVelocity.y = 0
//             }
//             else if(localVelocity.y < 0) {
//                 localVelocity.y += ut.Time.deltaTime * rigidbody.mass * ut.Time.deltaTime
//                 if(localVelocity.y > 0) localVelocity.y = 0
//             }
//         }
//     }
// }
var game;
(function (game) {
    var StaticForce2DFilter = /** @class */ (function (_super) {
        __extends(StaticForce2DFilter, _super);
        function StaticForce2DFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return StaticForce2DFilter;
    }(ut.EntityFilter));
    game.StaticForce2DFilter = StaticForce2DFilter;
    var StaticForce2DBehaviour = /** @class */ (function (_super) {
        __extends(StaticForce2DBehaviour, _super);
        function StaticForce2DBehaviour() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StaticForce2DBehaviour.prototype.OnEntityUpdate = function () {
            if (game.Service.isPaused)
                return;
            var localPosition = this.data.position.position, localVelocity = new Vector3(this.data.force.velocity.x, this.data.force.velocity.y);
            localVelocity = localPosition.add(localVelocity.multiplyScalar(ut.Time.deltaTime));
            this.data.position.position = localVelocity;
        };
        return StaticForce2DBehaviour;
    }(ut.ComponentBehaviour));
    game.StaticForce2DBehaviour = StaticForce2DBehaviour;
})(game || (game = {}));
var game;
(function (game) {
    var ScoreSystem = /** @class */ (function (_super) {
        __extends(ScoreSystem, _super);
        function ScoreSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScoreSystem.prototype.OnUpdate = function () {
            // if(game.Service.isPaused) return
            var config = this.world.getConfigData(game.Configuration);
            if (!config.init)
                return;
            var record = game.Service.getRecord();
            this.world.forEach([game.ScoreTag, ut.Text.Text2DRenderer], function (tag, renderer) {
                if (config.active)
                    renderer.text = "  Score : " + record.score.toString();
                else
                    renderer.text = record.score.toString();
            });
            this.world.setConfigData(config);
        };
        return ScoreSystem;
    }(ut.ComponentSystem));
    game.ScoreSystem = ScoreSystem;
})(game || (game = {}));
var ut;
(function (ut) {
    var JsonUtility = /** @class */ (function () {
        function JsonUtility() {
        }
        JsonUtility.loadAssetAsync = function (assetName, callback) {
            this.loadAsync(UT_ASSETS[assetName], callback);
        };
        JsonUtility.loadAsync = function (url, callback) {
            var xobj = new XMLHttpRequest();
            xobj.open('GET', url, true);
            xobj.onreadystatechange = function () {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                if (xobj.readyState == 4 && xobj.status == 200) {
                    try {
                        // callback(null , JSON.parse(xobj.responseText))   
                        callback(null, xobj.responseText);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            };
            xobj.send(null);
        };
        return JsonUtility;
    }());
    ut.JsonUtility = JsonUtility;
})(ut || (ut = {}));
var app;
(function (app) {
    var Service;
    (function (Service) {
        var PhysicsService = /** @class */ (function () {
            function PhysicsService() {
            }
            PhysicsService.addForce = function (world, entity, velocity) {
                if (world.hasComponent(entity, ut.Physics2D.SetVelocity2D))
                    world.removeComponent(entity, ut.Physics2D.SetVelocity2D);
                var setVelocity = new ut.Physics2D.SetVelocity2D;
                setVelocity.velocity = velocity;
                world.addComponentData(entity, setVelocity);
            };
            PhysicsService.addImpluse = function (world, entity, impluse) {
                if (world.hasComponent(entity, ut.Physics2D.AddImpulse2D))
                    world.removeComponent(entity, ut.Physics2D.AddImpulse2D);
                var setImpluse = new ut.Physics2D.AddImpulse2D;
                setImpluse.impulse = new Vector2(impluse.x, impluse.y);
                world.addComponentData(entity, setImpluse);
            };
            return PhysicsService;
        }());
        Service.PhysicsService = PhysicsService;
    })(Service = app.Service || (app.Service = {}));
})(app || (app = {}));
var app;
(function (app) {
    var Service;
    (function (Service) {
        var TransformService = /** @class */ (function () {
            function TransformService() {
            }
            TransformService.setParent = function (world, child, parent) {
                var node = world.getComponentData(child, ut.Core2D.TransformNode);
                node.parent = parent;
                world.setComponentData(child, node);
            };
            TransformService.getPointerWorldPosition = function (world, cameraEntity) {
                var displayInfo = world.getConfigData(ut.Core2D.DisplayInfo);
                var displaySize = new Vector2(displayInfo.width, displayInfo.height);
                var inputPosition = ut.Runtime.Input.getInputPosition();
                return ut.Core2D.TransformService.windowToWorld(world, cameraEntity, inputPosition, displaySize);
            };
            TransformService.getTouchWorldPosition = function (world, cameraEntity, touchOnScreen) {
                var displayInfo = world.getConfigData(ut.Core2D.DisplayInfo);
                var displaySize = new Vector2(displayInfo.width, displayInfo.height);
                var inputPosition = new Vector2(touchOnScreen.x, touchOnScreen.y);
                return ut.Core2D.TransformService.windowToWorld(world, cameraEntity, inputPosition, displaySize);
            };
            TransformService.getUniversalTouchWorldPosition = function () {
                var world = game.Service.getWorld(), camera = game.Service.getCamera(), displayInfo = world.getConfigData(ut.Core2D.DisplayInfo), displaySize = new Vector2(displayInfo.width, displayInfo.height);
                if (ut.Core2D.Input.isTouchSupported() && ut.Core2D.Input.touchCount() > 0) {
                    var touch = ut.Runtime.Input.getTouch(0);
                    var touchPosition = new Vector2(touch.x, touch.y);
                    return ut.Core2D.TransformService.windowToWorld(world, camera, touchPosition, displaySize);
                }
                else {
                    var mousePosition = ut.Runtime.Input.getInputPosition();
                    return ut.Core2D.TransformService.windowToWorld(world, camera, mousePosition, displaySize);
                }
            };
            TransformService.getScreenToWorldRect = function (world, cameraEntity) {
                var displayInfo = world.getConfigData(ut.Core2D.DisplayInfo);
                var displaySize = new Vector2(displayInfo.width, displayInfo.height);
                var topRight = ut.Core2D.TransformService.windowToWorld(world, cameraEntity, displaySize, displaySize);
                var bottomLeft = ut.Core2D.TransformService.windowToWorld(world, cameraEntity, new Vector2(0, 0), displaySize);
                var center = ut.Core2D.TransformService.windowToWorld(world, cameraEntity, new Vector2(displaySize.x / 2, displaySize.y / 2), displaySize);
                var width = Math.abs(bottomLeft.x - topRight.x);
                var height = Math.abs(topRight.y - bottomLeft.y);
                return new app.Geometry.Rect(center.x, center.y, width, height);
            };
            TransformService.animateScale3 = function (world, entity, size, time, delay, motion, loop) {
                var startSize = world.getComponentData(entity, ut.Core2D.TransformLocalScale);
                var scaleTween = new ut.Tweens.TweenDesc;
                scaleTween.cid = ut.Core2D.TransformLocalScale.cid;
                scaleTween.offset = 0;
                scaleTween.duration = time;
                scaleTween.func = motion == 0 ? ut.Tweens.TweenFunc.Linear : motion;
                scaleTween.loop = loop == 0 ? ut.Core2D.LoopMode.Once : loop;
                scaleTween.destroyWhenDone = true;
                scaleTween.t = delay;
                ut.Tweens.TweenService.addTweenVector3(world, entity, startSize.scale, size, scaleTween);
            };
            TransformService.animatePosition3 = function (world, entity, position, time, delay, motion, loop) {
                var startPosition = world.getComponentData(entity, ut.Core2D.TransformLocalPosition);
                var positionTween = new ut.Tweens.TweenDesc;
                positionTween.cid = ut.Core2D.TransformLocalScale.cid;
                positionTween.offset = 0;
                positionTween.duration = time;
                positionTween.func = motion == 0 ? ut.Tweens.TweenFunc.Linear : motion;
                positionTween.loop = loop == 0 ? ut.Core2D.LoopMode.Once : loop;
                positionTween.destroyWhenDone = true;
                positionTween.t = delay;
                ut.Tweens.TweenService.addTweenVector3(world, entity, startPosition.position, position, positionTween);
            };
            TransformService.animateUIposition2 = function (world, entity, position, time, delay, motion, loop) {
                var startPosition = world.getComponentData(entity, ut.UILayout.RectTransform);
                var positionTween = new ut.Tweens.TweenDesc;
                positionTween.cid = ut.UILayout.RectTransform.cid;
                positionTween.offset = 0;
                positionTween.duration = time;
                positionTween.func = motion == 0 ? ut.Tweens.TweenFunc.Linear : motion;
                positionTween.loop = loop == 0 ? ut.Core2D.LoopMode.Once : loop;
                positionTween.destroyWhenDone = true;
                positionTween.t = delay;
                ut.Tweens.TweenService.addTweenVector2(world, entity, startPosition.anchoredPosition, position, positionTween);
            };
            TransformService.animateQuaternion = function (world, entity, angleInRadians, time, motion, loop) {
                var startRotation = world.getComponentData(entity, ut.Core2D.TransformLocalRotation);
                var rotateTween = new ut.Tweens.TweenDesc;
                rotateTween.cid = ut.Core2D.TransformLocalRotation.cid;
                rotateTween.offset = 0;
                rotateTween.duration = time;
                rotateTween.func = motion == 0 ? ut.Tweens.TweenFunc.Linear : motion;
                rotateTween.loop = loop == 0 ? ut.Core2D.LoopMode.Once : loop;
                rotateTween.destroyWhenDone = true;
                rotateTween.t = 0.0;
                ut.Tweens.TweenService.addTweenQuaternion(world, entity, startRotation.rotation, new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angleInRadians), rotateTween);
            };
            return TransformService;
        }());
        Service.TransformService = TransformService;
    })(Service = app.Service || (app.Service = {}));
})(app || (app = {}));
var game;
(function (game) {
    var SpawnFilter = /** @class */ (function (_super) {
        __extends(SpawnFilter, _super);
        function SpawnFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SpawnFilter = __decorate([
            ut.requiredComponents(game.PoolEntity)
        ], SpawnFilter);
        return SpawnFilter;
    }(ut.EntityFilter));
    game.SpawnFilter = SpawnFilter;
    // FIXME: Complete the script
    var SpawnBehaviour = /** @class */ (function (_super) {
        __extends(SpawnBehaviour, _super);
        function SpawnBehaviour() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SpawnBehaviour.prototype.OnEntityEnable = function () {
            var config = game.Service.getConfig(this.world);
            // let config = game.Service.getConfig(this.world)
            var screenBound = app.Service.TransformService.getScreenToWorldRect(this.world, game.Service.getCamera());
            // set the min & max x of screen in world position
            this.data.spawn.minX = screenBound.min.x;
            this.data.spawn.maxX = screenBound.max.x;
            this.data.spawn.minY = screenBound.min.y;
            this.data.spawn.maxY = screenBound.max.y;
        };
        SpawnBehaviour.prototype.OnEntityUpdate = function () {
            // if(game.Service.isPaused) return
            var config = game.Service.getConfig(this.world);
            if (!config.active)
                return;
            var spawn = this.data.spawn;
            var time = spawn.time;
            var delay = spawn.delay;
            time -= ut.Time.deltaTime;
            // create point entity after delay
            if (time < 0) {
                // next time to spawn again
                time += delay;
                // get the entity groups to be instantiated
                var randEntityGroups = this.data.spawn.spawnEntityGroups;
                var randPointIndex = app.Mathf.getRandomInt(0, randEntityGroups.length - 1);
                if (randPointIndex >= 0) {
                    // instantiate
                    var entities_1 = this.data.pool.entities;
                    var clone = ut.NONE;
                    // Find a disabled entity for reuse
                    for (var i = 0; i < entities_1.length; i++) {
                        if (this.world.hasComponent(entities_1[i], ut.Disabled)) {
                            clone = entities_1[i];
                            this.world.removeComponent(clone, ut.Disabled);
                        }
                    }
                    // Check if we have found the match or not
                    if (clone.isNone()) {
                        clone = ut.EntityGroup.instantiate(this.world, randEntityGroups[randPointIndex])[0];
                        this.world.setEntityName(clone, randPointIndex + "-" + this.data.pool.entities.length);
                        this.data.pool.entities.push(new ut.Entity(clone.index, clone.version));
                    }
                    // Align the position randomly on sides
                    if (spawn.spawnHorizontally && spawn.spawnVertically) {
                        var randPosition = app.Mathf.getRandomInt(0, 9) >= 5 ? true : false;
                        if (randPosition)
                            this.setPositionHorizontally(clone, spawn);
                        else
                            this.setPositionVertically(clone, spawn);
                    }
                    else {
                        if (spawn.spawnHorizontally) {
                            this.setPositionHorizontally(clone, spawn);
                        }
                        else if (spawn.spawnVertically) {
                            this.setPositionVertically(clone, spawn);
                        }
                    }
                    // reduce delay every new entity create
                    if (spawn.exponentialDelay && spawn.delay > spawn.leastDelay)
                        spawn.delay -= ut.Time.deltaTime;
                }
            }
            spawn.time = time;
        };
        SpawnBehaviour.prototype.setPositionVertically = function (clone, spawn) {
        };
        SpawnBehaviour.prototype.setPositionHorizontally = function (clone, spawn) {
            var epsilonBoundary = 0.1, signValueMin = app.Mathf.getSign(spawn.minX), signValueMax = app.Mathf.getSign(spawn.maxX);
            this.world.usingComponentData(clone, [ut.HitBox2D.RectHitBox2D, ut.Core2D.TransformLocalPosition], function (rectHitBox, position) {
                var box = rectHitBox.box, width = box._width / 2;
                var randX = app.Mathf.getRandomFloat(signValueMin * (Math.abs(spawn.minX) - width - epsilonBoundary), signValueMax * (Math.abs(spawn.maxX) - width - epsilonBoundary));
                position.position = new Vector3(randX, spawn.maxY);
            });
            this.world.usingComponentData(clone, [ut.Physics2D.BoxCollider2D, ut.Core2D.TransformLocalPosition], function (boxCollider, position) {
                var size = boxCollider.size, width = size.x / 2;
                var randX = app.Mathf.getRandomFloat(signValueMin * (Math.abs(spawn.minX) - width - epsilonBoundary), signValueMax * (Math.abs(spawn.maxX) - width - epsilonBoundary));
                position.position = new Vector3(randX, spawn.maxY);
            });
        };
        return SpawnBehaviour;
    }(ut.ComponentBehaviour));
    game.SpawnBehaviour = SpawnBehaviour;
})(game || (game = {}));
// namespace game {
//     export class ClockSystem extends ut.ComponentSystem {
//         OnUpdate() : void {
// if(game.Service.isPaused) return
//             let config = this.world.getConfigData(game.Configuration)
//             if(!config.active) {
//                 ut.Time.reset()
//                 return
//             }
//             this.world.forEach([game.Clock] , (clock)=>{
//                 let time = clock.time 
//                 let angle = 360/time
//                 angle *= (time-ut.Time.time)
//                 angle *= Math.PI/180
//                 // On Second'ss Hand
//                 let secondHand = clock.secondHand ,
//                     rotation = this.world.getComponentData(secondHand , ut.Core2D.TransformLocalRotation)
//                 rotation.rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle)
//                 this.world.setComponentData(secondHand , rotation)
//                 // Once the game is over
//                 if(ut.Time.time > time) {
//                     config.active = false
//                     ut.EntityGroup.instantiate(this.world , "game.OnEndGroup")
//                     setTimeout((world : ut.World)=>{
//                         ut.EntityGroup.destroyAll(world , "game.Block")
//                         ut.EntityGroup.destroyAll(world , "game.Clock")
//                         // ut.EntityGroup.destroyAll(world , "game.MainGroup")
//                     } , 10 , this.world)
//                 }
//             })
//             this.world.setConfigData(config)
//         }
//     }
// }
var game;
(function (game) {
    var CrossButtonSystem = /** @class */ (function (_super) {
        __extends(CrossButtonSystem, _super);
        function CrossButtonSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CrossButtonSystem.prototype.OnUpdate = function () {
            // if(game.Service.isPaused) return
            var config = game.Service.getConfig(this.world);
            // Once game time passes 30 secs we set game to complete and pop up a close button
            if (ut.Time.time >= config.taskCompletionTime && !config.complete) {
                config.complete = true;
                this.instantiateCrossButtonUI();
            }
            // Animation
            this.animateCrossButtonUI();
            // Apply changes
            game.Service.setConfig(config);
        };
        CrossButtonSystem.prototype.instantiateCrossButtonUI = function () {
            var _this = this;
            ut.EntityGroup.instantiate(this.world, "game.CrossButtonGroup");
            this.world.forEach([game.CrossUITag, ut.Entity, ut.UILayout.RectTransform], function (tag, entity, rect) {
                app.UIService.anchorTopRight(_this.world, entity, new Vector2(350, -90), new Vector2(1, 1));
            });
        };
        CrossButtonSystem.prototype.animateCrossButtonUI = function () {
            var _this = this;
            this.world.forEach([ut.Entity, game.CrossUITag, ut.UILayout.RectTransform], function (entity, tag, rect) {
                var position = rect.anchoredPosition;
                if (tag.showing) {
                    app.UIService.anchorTopRight(_this.world, entity, position.lerp(new Vector2(60, -90), ut.Time.deltaTime * 2), new Vector2(1, 1));
                    if (position.x < 121) {
                        tag.showing = false;
                        // Wait for a while before hiding
                        setTimeout(function (entity) {
                            this.world.usingComponentData(entity, [game.CrossUITag], function (tag) {
                                tag.hiding = true;
                            });
                        }.bind(_this), 1000, new ut.Entity(entity.index, entity.version));
                    }
                }
                if (tag.hiding) {
                    app.UIService.anchorTopRight(_this.world, entity, position.lerp(new Vector2(260, -90), ut.Time.deltaTime * 2), new Vector2(1, 1));
                    if (position.x > 260 && position.x < 261) {
                        tag.hiding = false;
                    }
                }
            });
        };
        return CrossButtonSystem;
    }(ut.ComponentSystem));
    game.CrossButtonSystem = CrossButtonSystem;
})(game || (game = {}));
var ut;
(function (ut) {
    /**
     * Placeholder system to provide a UnityEngine.Time like API
     *
     * e.g.
     *  let deltaTime = ut.Time.deltaTime();
     *  let time = ut.Time.time();
     *
     */
    var Time = /** @class */ (function (_super) {
        __extends(Time, _super);
        function Time() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Time_1 = Time;
        Object.defineProperty(Time, "deltaTime", {
            get: function () {
                return Time_1._deltaTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Time, "time", {
            get: function () {
                return Time_1._time;
            },
            enumerable: true,
            configurable: true
        });
        Time.reset = function () {
            Time_1._time = 0;
        };
        Time.prototype.OnUpdate = function () {
            // if(game.Service.isPaused) return
            // let dt = this.scheduler.deltaTime();
            var dt = 0.02;
            Time_1._deltaTime = dt;
            Time_1._time += dt;
        };
        var Time_1;
        Time._deltaTime = 0;
        Time._time = 0;
        Time = Time_1 = __decorate([
            ut.executeBefore(ut.Shared.UserCodeStart)
        ], Time);
        return Time;
    }(ut.ComponentSystem));
    ut.Time = Time;
})(ut || (ut = {}));
var game;
(function (game) {
    var TimerSystem = /** @class */ (function (_super) {
        __extends(TimerSystem, _super);
        function TimerSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TimerSystem.prototype.OnUpdate = function () {
            // if(game.Service.isPaused) return
            var config = this.world.getConfigData(game.Configuration);
            if (!config.active)
                return;
            var record = game.Service.getRecord();
            this.world.forEach([game.Timer, ut.Text.Text2DRenderer], function (timer, renderer) {
                var time = timer.time;
                time -= ut.Time.deltaTime;
                // Once the game is over
                if (time <= 0) {
                    record.live = 0;
                    time = 0;
                }
                renderer.text = time.toFixed(1) + "";
                timer.time = time;
            });
            game.Service.setRecord(record);
        };
        return TimerSystem;
    }(ut.ComponentSystem));
    game.TimerSystem = TimerSystem;
})(game || (game = {}));
var game;
(function (game) {
    var DragService = /** @class */ (function () {
        function DragService() {
        }
        DragService.getDrag = function () {
            return this.currentDrag;
        };
        DragService.setDrag = function (drag) {
            this.currentDrag = drag;
        };
        DragService.currentDrag = ut.NONE;
        return DragService;
    }());
    game.DragService = DragService;
})(game || (game = {}));
var game;
(function (game) {
    var DragSystem = /** @class */ (function (_super) {
        __extends(DragSystem, _super);
        function DragSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DragSystem.prototype.OnUpdate = function () {
            var _this = this;
            // if(game.Service.isPaused) return
            var config = game.Service.getConfig(this.world);
            var record = game.Service.getRecord();
            if (record.live <= 0) {
                return;
            }
            var drag = game.DragService.getDrag();
            if (drag.isNone()) {
                drag = game.Service.mouseButtonDownOnEntity();
                if (drag.isNone() || !this.world.hasComponent(drag, game.Draggable))
                    return;
                game.DragService.setDrag(new ut.Entity(drag.index, drag.version));
            }
            this.world.usingComponentData(drag, [game.Draggable, ut.Core2D.LayerSorting, ut.Core2D.TransformLocalPosition], function (draggable, layerSorting, position) {
                if (ut.Core2D.Input.getMouseButtonDown(0)) {
                    var mouse = ut.Core2D.Input.getInputPosition();
                    draggable.lastTouch = new Vector2(mouse.x, mouse.y);
                    draggable.isDrag = true;
                    // Increase the order to make it visible over all images
                    draggable.order = layerSorting.order;
                    layerSorting.order = 999;
                    // ANIMATION
                    app.Service.TransformService.animateScale3(_this.world, drag, new Vector3(0.7, 0.7, 1), 0.1, 0, ut.Tweens.TweenFunc.Linear, ut.Core2D.LoopMode.Once);
                }
                else if (ut.Core2D.Input.getMouseButton(0)) {
                    var worldTouch = app.Service.TransformService.getUniversalTouchWorldPosition();
                    if (draggable.isDrag)
                        position.position = new Vector3(worldTouch.x, worldTouch.y, 0);
                }
                else if (ut.Core2D.Input.getMouseButtonUp(0)) {
                    if (draggable.isDrag) {
                        draggable.isDrag = false;
                        // Increase the order to make it visible over all images
                        layerSorting.order = draggable.order;
                        // ANIMATION
                        app.Service.TransformService.animateScale3(_this.world, drag, new Vector3(1, 1, 1), 0.1, 0, ut.Tweens.TweenFunc.Linear, ut.Core2D.LoopMode.Once);
                    }
                    game.DragService.setDrag(ut.NONE);
                    if (_this.world.hasComponent(drag, game.ItemTag)) {
                        var item = _this.world.getComponentData(drag, game.ItemTag);
                        position.position = item.originalPosition;
                    }
                }
            });
        };
        return DragSystem;
    }(ut.ComponentSystem));
    game.DragSystem = DragSystem;
})(game || (game = {}));
// namespace game {
//     export class DragUIFilter extends ut.EntityFilter {
//         entity : ut.Entity
//         draggable : game.Draggable
//         rectTransform : ut.UILayout.RectTransform
//         interaction : ut.UIControls.MouseInteraction
//         layerSorting : ut.Core2D.LayerSorting
//     }
//     export class DragUIBehaviour extends ut.ComponentBehaviour {
//         data : DragUIFilter
//         OnEntityUpdate() :void {
// if(game.Service.isPaused) return
//             if(!this.data.draggable.canDrag) return
//             if(ut.Core2D.Input.isTouchSupported() && ut.Core2D.Input.touchCount() > 0) {
//                 let touch = ut.Core2D.Input.getTouch(0) , 
//                     touchPos = new Vector2(touch.x , touch.y)
//                 switch(touch.phase) {
//                     case ut.Core2D.TouchState.Began :
//                         if(this.data.interaction.over) {
//                             let mouse = ut.Core2D.Input.getInputPosition()
//                                 this.data.draggable.lastTouch = new Vector2(mouse.x , mouse.y)
//                                 this.data.draggable.isDrag = true
//                             // Increase the order to make it visible over all images
//                             this.data.draggable.order = this.data.layerSorting.order
//                             this.data.layerSorting.order = 999
//                             // ANIMATION
//                             app.Service.TransformService.animateScale3(
//                                 this.world , 
//                                 this.data.entity ,
//                                 new Vector3(0.7,0.7,1) ,
//                                 0.1 ,
//                                 0 ,
//                                 ut.Tweens.TweenFunc.Linear ,
//                                 ut.Core2D.LoopMode.Once
//                             )
//                         }
//                         break ;
//                     case ut.Core2D.TouchState.Moved :
//                         if(this.data.draggable.isDrag) {
//                             let lastTouch = this.data.draggable.lastTouch ,
//                                 // FIXME: multiplied a scalar 1.2 value . The screen point is different than the canvas world size
//                                 updatePos = new Vector2().subVectors(touchPos , lastTouch).multiplyScalar(0.81)
//                             this.data.rectTransform.anchoredPosition.add(updatePos)
//                             this.data.draggable.lastTouch = touchPos
//                         }
//                         break
//                     case ut.Core2D.TouchState.Ended :
//                         if(this.data.draggable.isDrag) {
//                             this.data.draggable.isDrag = false
//                             // Increase the order to make it visible over all images
//                             this.data.layerSorting.order = this.data.draggable.order
//                             // ANIMATION
//                             app.Service.TransformService.animateScale3(
//                                 this.world , 
//                                 this.data.entity ,
//                                 new Vector3(1,1,1) ,
//                                 0.1 ,
//                                 0 ,
//                                 ut.Tweens.TweenFunc.Linear ,
//                                 ut.Core2D.LoopMode.Once
//                             )
//                         }
//                     default :
//                         break
//                 }
//             }
//             else {
//                 if(ut.Core2D.Input.getMouseButtonDown(0)) {
//                     if(this.data.interaction.over) {
//                         let mouse = ut.Core2D.Input.getInputPosition()
//                             this.data.draggable.lastTouch = new Vector2(mouse.x , mouse.y)
//                             this.data.draggable.isDrag = true
//                         // Increase the order to make it visible over all images
//                         this.data.draggable.order = this.data.layerSorting.order
//                         this.data.layerSorting.order = 999
//                         // ANIMATION
//                         app.Service.TransformService.animateScale3(
//                             this.world , 
//                             this.data.entity ,
//                             new Vector3(0.7,0.7,1) ,
//                             0.1 ,
//                             0 ,
//                             ut.Tweens.TweenFunc.Linear ,
//                             ut.Core2D.LoopMode.Once
//                         )
//                     }
//                 }
//                 else if(ut.Core2D.Input.getMouseButton(0)) {
//                     if(this.data.draggable.isDrag) {
//                         let mouseTouch = ut.Core2D.Input.getInputPosition() ,
//                             lastTouch = this.data.draggable.lastTouch ,
//                             // FIXME: multiplied a scalar 1.2 value . The screen point is different than the canvas world size
//                             updatePos = new Vector2().subVectors(mouseTouch , lastTouch).multiplyScalar(0.81)
//                         this.data.rectTransform.anchoredPosition.add(updatePos)
//                         this.data.draggable.lastTouch = mouseTouch
//                     }
//                 }
//                 else if(ut.Core2D.Input.getMouseButtonUp(0)) {
//                     if(this.data.draggable.isDrag) {
//                         this.data.draggable.isDrag = false
//                         // Increase the order to make it visible over all images
//                         this.data.layerSorting.order = this.data.draggable.order
//                         // ANIMATION
//                         app.Service.TransformService.animateScale3(
//                             this.world , 
//                             this.data.entity ,
//                             new Vector3(1,1,1) ,
//                             0.1 ,
//                             0 ,
//                             ut.Tweens.TweenFunc.Linear ,
//                             ut.Core2D.LoopMode.Once
//                         )
//                     }
//                 }
//             }
//         }
//     }
// }
var app;
(function (app) {
    var UIService = /** @class */ (function () {
        function UIService() {
        }
        UIService.anchorCenter = function (world, entity, position, size) {
            var rectTransform = world.getComponentData(entity, ut.UILayout.RectTransform);
            rectTransform.anchorMin = new Vector2(0.5, 0.5);
            rectTransform.anchorMax = new Vector2(0.5, 0.5);
            rectTransform.anchoredPosition = position || new Vector2(0, 0);
            rectTransform.sizeDelta = size || new Vector2(200, 200);
            world.setComponentData(entity, rectTransform);
            return entity;
        };
        UIService.anchorTopRight = function (world, entity, position, size) {
            var rectTransform = world.getComponentData(entity, ut.UILayout.RectTransform);
            // rectTransform.anchorMin = new Vector2(1,1)
            // rectTransform.anchorMax = new Vector2(1,1)
            rectTransform.anchoredPosition = position || new Vector2(0, 0);
            rectTransform.sizeDelta = size || new Vector2(200, 200);
            world.setComponentData(entity, rectTransform);
            return entity;
        };
        UIService.instantiateUI = function (world, entityName) {
            // create ui
            var clone = ut.EntityGroup.instantiate(world, entityName)[0];
            // assign camera to ui
            var canvas = world.getComponentData(clone, ut.UILayout.UICanvas);
            // try to get the reference
            if (!world.exists(this.CanvasCameraEntity)) {
                this.CanvasCameraEntity = world.getEntityByName("CanvasCamera");
                if (!world.exists(this.CanvasCameraEntity)) {
                    this.CanvasCameraEntity = null;
                    return null;
                }
            }
            canvas.camera = this.CanvasCameraEntity;
            world.setComponentData(clone, canvas);
        };
        UIService.instantiateUIButton = function (world, entityName, events) {
            // create ui
            var clone = ut.EntityGroup.instantiate(world, entityName)[0];
            // add Callbacks
            if (events.onClick)
                ut.UIControls.UIControlsService.addOnClickCallback(world, clone, events.onClick);
            if (events.onDown)
                ut.UIControls.UIControlsService.addOnDownCallback(world, clone, events.onDown);
            if (events.onEnter)
                ut.UIControls.UIControlsService.addOnEnterCallback(world, clone, events.onEnter);
            if (events.onLeave)
                ut.UIControls.UIControlsService.addOnLeaveCallback(world, clone, events.onLeave);
            if (events.onUp)
                ut.UIControls.UIControlsService.addOnUpCallback(world, clone, events.onUp);
            // assign camera to ui
            var canvas = world.getComponentData(clone, ut.UILayout.UICanvas);
            // try to get the reference
            if (!world.exists(this.CanvasCameraEntity)) {
                this.CanvasCameraEntity = world.getEntityByName("CanvasCamera");
                if (!world.exists(this.CanvasCameraEntity)) {
                    this.CanvasCameraEntity = null;
                    return null;
                }
            }
            canvas.camera = this.CanvasCameraEntity;
            world.setComponentData(clone, canvas);
        };
        return UIService;
    }());
    app.UIService = UIService;
})(app || (app = {}));
(function (app) {
    var UI;
    (function (UI) {
        var Events = /** @class */ (function () {
            function Events(onClick, onDown, onEnter, onLeave, onUp) {
                this.onClick = onClick;
                this.onDown = onDown;
                this.onEnter = onEnter;
                this.onLeave = onLeave;
                this.onUp = onUp;
            }
            return Events;
        }());
        UI.Events = Events;
    })(UI = app.UI || (app.UI = {}));
})(app || (app = {}));
var game;
(function (game) {
    var GameSystem = /** @class */ (function (_super) {
        __extends(GameSystem, _super);
        function GameSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GameSystem.prototype.OnUpdate = function () {
            if (game.Service.isPaused)
                return;
            var config = game.Service.getConfig(this.world);
            var record = game.Service.getRecord();
            // Once all of lives are finished
            if (record.live <= 0) {
                if (config.uiState == game.GameUIStateEnum.complete || config.uiState == game.GameUIStateEnum.failure)
                    return;
                if (config.complete) {
                    console.log("%c Complete Screen", 'background: #33ccff; color: #ffffff');
                    this.onSuccess(config);
                }
                else {
                    console.log("%c Failure Screen", 'background: #33ccff; color: #ffffff');
                    this.onFailure(config);
                }
            }
            game.Service.setRecord(record);
            game.Service.setConfig(config);
        };
        GameSystem.prototype.onSuccess = function (config) {
            var _this = this;
            config.active = false;
            config.playable = false;
            config.uiState = game.GameUIStateEnum.complete;
            setTimeout(function () {
                ut.EntityGroup.instantiate(_this.world, "game.OnEndGroup");
            }, 1000);
        };
        GameSystem.prototype.onFailure = function (config) {
            var _this = this;
            if (config.uiState == game.GameUIStateEnum.complete || config.uiState == game.GameUIStateEnum.failure)
                return;
            config.active = false;
            config.playable = false;
            config.uiState = game.GameUIStateEnum.failure;
            setTimeout(function () {
                ut.EntityGroup.instantiate(_this.world, "game.OnFailGroup");
            }, 1000);
        };
        return GameSystem;
    }(ut.ComponentSystem));
    game.GameSystem = GameSystem;
})(game || (game = {}));
/*
This is a hack to work around https://forum.unity.com/threads/bug-renderer-fails-to-take-into-account-screen-dpi.601087/
Instructions:
Put the following code in a Behavior / System which gets included in your game.
Place the code NEXT to your namespace definition i.e...
(function HDPI_Hacks_By_abeisgreat() {
  ...
})();
namespace game {
  ...
}
It should not go inside the namespace.
*/
(function HDPI_Hacks_By_abeisgreat() {
    var w = window;
    var initialize_hack = function () {
        console.log("%c Initializing HDPI hacks", 'background: #00cc00; color: #ffffff');
        var fakeMouseEventFn = function (ev) {
            var ut_HTML = w.ut._HTML;
            var fakeEvent = {
                type: ev.type,
                pageX: ev.pageX * window.devicePixelRatio,
                pageY: ev.pageY * window.devicePixelRatio,
                preventDefault: function () { },
                stopPropagation: function () { }
            };
            ut_HTML.mouseEventFn(fakeEvent);
            ev.preventDefault();
            ev.stopPropagation();
        };
        var fakeTouchEventFn = function (ev) {
            var ut_HTML = w.ut._HTML;
            var changedTouches = [];
            for (var index = 0; index < ev.changedTouches.length; index++) {
                var touch = ev.changedTouches[index];
                changedTouches.push({
                    identifier: touch.identifier,
                    pageX: touch.pageX * window.devicePixelRatio,
                    pageY: touch.pageY * window.devicePixelRatio
                });
            }
            var fakeEvent = {
                type: ev.type,
                changedTouches: changedTouches,
                preventDefault: function () { },
                stopPropagation: function () { }
            };
            ut_HTML.touchEventFn(fakeEvent);
            ev.preventDefault();
            ev.stopPropagation();
        };
        window.addEventListener("resize", function () {
            var ut = w.ut;
            ut._HTML.onDisplayUpdated(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, window.screen.width * window.devicePixelRatio, window.screen.height * window.devicePixelRatio, -1);
            ut._HTML.canvasElement.style.width = window.innerWidth + "px";
            ut._HTML.canvasElement.style.height = window.innerHeight + "px";
            // ut._HTML.canvasElement.style.width = '100%';
            // ut._HTML.canvasElement.style.height = '100%';
            ut._HTML.stopResizeListening();
            var mouseEvents = ["down", "move", "up"];
            var touchEvents = ["touch", "cancel", "move", "start", "end"];
            mouseEvents.forEach(function (type) {
                var eventType = "mouse" + type;
                ut._HTML.canvasElement.removeEventListener(eventType, fakeMouseEventFn);
                ut._HTML.canvasElement.addEventListener(eventType, fakeMouseEventFn);
            });
            touchEvents.forEach(function (type) {
                var eventType = "touch" + type;
                ut._HTML.canvasElement.removeEventListener(eventType, fakeTouchEventFn);
                ut._HTML.canvasElement.addEventListener(eventType, fakeTouchEventFn);
            });
            setTimeout(function () {
                mouseEvents.forEach(function (type) {
                    ut._HTML.canvasElement.removeEventListener("mouse" + type, ut._HTML.mouseEventFn);
                });
                touchEvents.forEach(function (type) {
                    ut._HTML.canvasElement.removeEventListener("touch" + type, ut._HTML.touchEventFn);
                });
            }, 100);
        });
        window.dispatchEvent(new Event("resize"));
    };
    var intervalID = setInterval(function () {
        var w = window;
        var ut = w.ut;
        if (ut._HTML.canvasElement && w.known_ut_HTML !== ut._HTML) {
            w.known_ut_HTML = ut._HTML;
            clearInterval(intervalID);
            initialize_hack();
        }
    }, 10);
})();
window.onblur = function () {
    game.Service.setPause = true;
    document.title = "blur";
};
window.onfocus = function () {
    game.Service.setPause = false;
    document.title = "focus";
};
var game;
(function (game) {
    var InitializeSystem = /** @class */ (function (_super) {
        __extends(InitializeSystem, _super);
        function InitializeSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InitializeSystem.prototype.OnUpdate = function () {
            // if(game.Service.isPaused) return
            var config = game.Service.getConfig(this.world);
            if (config.init)
                return;
            if (config.loaded) {
                console.log("%c Initializing Game", 'background: #00cc00; color: #ffffff');
                // initialize system
                var record = game.Service.createRecord();
                if (!record)
                    throw "Error : There was Error finding Record";
                // Initialize the game
                this.initialize(config, record);
                // set initialized & make game playable
                config.init = true;
                config.playable = false; // this allows user to touch once again after game starts
                game.Service.setRecord(record);
            }
            else if (!config.loading) {
                game.Service.addExplicitScript(UT_ASSETS["androidFunc"], function () {
                    game.Service.addExplicitScript(UT_ASSETS["iosFunc"], function () {
                        game.Service.addExplicitScript(UT_ASSETS["assetLoader"], function () {
                        });
                    });
                });
                config.loading = true;
            }
            // set the data
            game.Service.setConfig(config);
        };
        InitializeSystem.prototype.initialize = function (config, record) {
            this.destroy();
            this.instantiate();
            this.create();
            // SOMEHINGS BUGGY
            setTimeout(this.AlignBounds, 2000, this.world);
            this.world.forEach([game.Timer], function (timer) {
                timer.time = config.taskCompletionTime;
            });
        };
        // Destroy the groups you have created (this method is usefull when we are restarting game)
        InitializeSystem.prototype.destroy = function () {
            // Main Groups
            ut.EntityGroup.destroyAll(this.world, "game.MainGroup");
            ut.EntityGroup.destroyAll(this.world, "game.OnFailGroup");
            ut.EntityGroup.destroyAll(this.world, "game.OnEndGroup");
            // Your Groups
        };
        // Instantiate required groups .
        InitializeSystem.prototype.instantiate = function () {
            game.Service.instantiateAndLoadAssets("game.MainGroup");
            game.Service.instantiateAndLoadAssets("game.GameDemoGroup");
        };
        // You custom init
        InitializeSystem.prototype.create = function () {
        };
        // Not complete . This is used for creating bounds(colliders) on the edges of screen. Comment if not required
        InitializeSystem.prototype.AlignBounds = function (world) {
            var _this = this;
            world.forEach([ut.Entity, game.Bounds], function (entity, bounds) {
                var worldRect = app.Service.TransformService.getScreenToWorldRect(world, entity), width = worldRect.width / 2, height = worldRect.height / 2;
                if (!bounds.top.isNone()) {
                    if (world.hasComponent(bounds.top, ut.HitBox2D.RectHitBox2D)) {
                        var topCollider = world.getComponentData(bounds.top, ut.HitBox2D.RectHitBox2D), topPosition = world.getComponentData(bounds.top, ut.Core2D.TransformLocalPosition), topLocalPosition = topPosition.position;
                        topLocalPosition = new Vector3(topLocalPosition.x, height + topCollider.box._height / 2);
                        topPosition.position = topLocalPosition;
                        world.setComponentData(bounds.top, topPosition);
                    }
                    else if (world.hasComponent(bounds.top, ut.Physics2D.BoxCollider2D)) {
                        var topCollider = world.getComponentData(bounds.top, ut.Physics2D.BoxCollider2D), topPosition = world.getComponentData(bounds.top, ut.Core2D.TransformLocalPosition), topLocalPosition = topPosition.position;
                        topLocalPosition = new Vector3(topLocalPosition.x, height + topCollider.size.y / 2);
                        topPosition.position = topLocalPosition;
                        world.setComponentData(bounds.top, topPosition);
                    }
                }
                if (!bounds.bottom.isNone()) {
                    var bottomCollider = _this.world.getComponentData(bounds.bottom, ut.Physics2D.BoxCollider2D), bottomPosition = _this.world.getComponentData(bounds.bottom, ut.Core2D.TransformLocalPosition), bottomLocalPosition = bottomPosition.position;
                    bottomLocalPosition = new Vector3(bottomLocalPosition.x, -height - bottomCollider.size.y / 2);
                    bottomPosition.position = bottomLocalPosition;
                    _this.world.setComponentData(bounds.bottom, bottomPosition);
                }
                if (!bounds.right.isNone()) {
                    var rightCollider = _this.world.getComponentData(bounds.right, ut.Physics2D.BoxCollider2D), rightPosition = _this.world.getComponentData(bounds.right, ut.Core2D.TransformLocalPosition), rightLocalPosition = rightPosition.position;
                    rightLocalPosition = new Vector3(rightCollider.size.x / 2 + width, rightLocalPosition.y);
                    rightPosition.position = rightLocalPosition;
                    _this.world.setComponentData(bounds.right, rightPosition);
                }
                if (!bounds.left.isNone()) {
                    var leftCollider = _this.world.getComponentData(bounds.left, ut.Physics2D.BoxCollider2D), leftPosition = _this.world.getComponentData(bounds.left, ut.Core2D.TransformLocalPosition), leftLocalPosition = leftPosition.position;
                    leftLocalPosition = new Vector3(-leftCollider.size.x / 2 - width, leftLocalPosition.y);
                    leftPosition.position = leftLocalPosition;
                    _this.world.setComponentData(bounds.left, leftPosition);
                }
            });
        };
        return InitializeSystem;
    }(ut.ComponentSystem));
    game.InitializeSystem = InitializeSystem;
})(game || (game = {}));
var game;
(function (game) {
    var Service = /** @class */ (function () {
        function Service() {
        }
        Service.getWorld = function () {
            return game.Service.world;
        };
        Service.getCamera = function () {
            return game.Service.camera;
        };
        Object.defineProperty(Service, "setPause", {
            set: function (value) {
                this._isPaused = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Service, "isPaused", {
            get: function () {
                return this._isPaused;
            },
            enumerable: true,
            configurable: true
        });
        // If it already exists it destroys it and creates new .
        // Use full for initializing method or restarting the game
        Service.createRecord = function () {
            var world = game.Service.world;
            ut.EntityGroup.destroyAll(world, "game.RecordGroup");
            game.Service.record = null;
            game.Service.record = ut.EntityGroup.instantiate(world, "game.RecordGroup")[0];
            return world.getComponentData(game.Service.record, game.Record);
        };
        Service.getRecord = function () {
            var world = game.Service.world;
            if (!world.exists(game.Service.record)) {
                game.Service.record = world.getEntityByName("Record");
                if (game.Service.record == null || game.Service.record.isNone()) {
                    game.Service.record == null;
                    this.createRecord();
                }
            }
            return world.getComponentData(game.Service.record, game.Record);
        };
        Service.setRecord = function (data) {
            var world = game.Service.world;
            if (!world.exists(game.Service.record)) {
                game.Service.record = world.getEntityByName("Record");
                if (game.Service.record == null) {
                    game.Service.record = null;
                    return null;
                }
            }
            world.setComponentData(game.Service.record, data);
            return data;
        };
        // Method returns the entity is present in current world
        Service.exists = function (world, entity) {
            if (entity.isNone() || entity.index == 0 || entity.version == 0)
                return false;
            if (!world.exists(entity))
                return false;
            return true;
        };
        Service.sameEntity = function (one, two) {
            if (one.index == two.index && one.version == two.version)
                return true;
            return false;
        };
        // Custom methods to make it simple
        // modify this (0.0)
        Service.getConfig = function (world) {
            game.Service.world = world;
            game.Service.camera = world.getEntityByName("Camera");
            return world.getConfigData(game.Configuration);
        };
        Service.setConfig = function (config) {
            game.Service.world.setConfigData(config);
        };
        // public Callback: (name:string) => void
        Service.addExplicitScript = function (src, callback) {
            var script = document.createElement('script');
            script.setAttribute('src', src);
            script.addEventListener('load', function (event) {
                callback();
            }, false);
            document.body.appendChild(script);
        };
        // CREATE A METHOD TO REVERT ON ERROR
        // FILES USED : assetLoader.js => checkStreamingStatus()
        Service.getAssetStatus = function () {
            var _this = this;
            var downloaded = true, error = false;
            this.world.forEach([ut.Core2D.Image2D], function (image) {
                switch (image.status) {
                    case ut.Core2D.ImageStatus.Loaded:
                        downloaded = false;
                        break;
                    case ut.Core2D.ImageStatus.LoadError:
                        console.warn("%c Load Error : " + image.sourceName, 'background: #ffcc00; color: #ffffff');
                        error = true;
                        break;
                }
            });
            if (error) {
                // api call to server on asset loading error
                // unload the assets
                this.world.forEach([ut.Entity, game.StreamAssetTag], function (entity, tag) {
                    _this.world.destroyEntity(entity);
                });
                var config = game.Service.getConfig(this.world);
                config.stream_sprites.length = 0;
                game.Service.setConfig(config);
            }
            return downloaded;
        };
        Service.downloadImage = function (name, url) {
            // Create Holder
            var holder = this.world.createEntity();
            this.world.setEntityName(holder, name + "_Holder");
            this.world.addComponent(holder, ut.Core2D.TransformNode);
            this.world.addComponent(holder, game.StreamAssetTag);
            // Create Texture Entity
            var texture2D = this.world.createEntity();
            this.world.setEntityName(texture2D, name + "_texture2D");
            this.world.addComponent(texture2D, ut.Core2D.Image2DLoadFromFile);
            this.world.usingComponentData(texture2D, [ut.Core2D.TransformNode, ut.Core2D.Image2DLoadFromFile], function (node, file) {
                node.parent = holder;
                file.imageFile = url;
            });
            // Load Texture Entity
            this.world.addComponent(texture2D, ut.Core2D.Image2D);
            // Create Sprite Entity
            var sprite2D = this.world.createEntity();
            this.world.setEntityName(sprite2D, name + "_sprite2D");
            this.world.addComponent(sprite2D, ut.Core2D.Sprite2D);
            this.world.usingComponentData(sprite2D, [ut.Core2D.TransformNode, ut.Core2D.Sprite2D], function (node, sprite) {
                node.parent = holder;
                sprite.image = texture2D;
                sprite.pivot = new Vector2(0.5, 0.5);
            });
            return new ut.Entity(sprite2D.index, sprite2D.version);
        };
        Service.instantiateAndLoadAssets = function (name) {
            var _this = this;
            ut.EntityGroup.instantiate(this.world, name);
            var config = game.Service.getConfig(this.world);
            var lengthSprites = config.stream_sprites.length;
            if (lengthSprites <= 0)
                return;
            this.world.forEach([ut.Entity, game.DownloadOnLoad], function (entity, tag) {
                var entityName = _this.world.getEntityName(entity);
                entityName += "_sprite2D";
                var _loop_1 = function (i) {
                    var streamSprite = config.stream_sprites[i];
                    var streamSpriteName = _this.world.getEntityName(streamSprite);
                    // Find the image from pool of downloaded objects and replace the downloaded asset
                    if (entityName == streamSpriteName) {
                        _this.world.usingComponentData(entity, [ut.Core2D.Sprite2DRenderer], function (renderer) {
                            var pixelsToWorldUnits;
                            var pixelSize;
                            // Grab the original pixel Units and ratio
                            _this.world.usingComponentData(renderer.sprite, [ut.Core2D.Sprite2D], function (sprite) {
                                _this.world.usingComponentData(sprite.image, [ut.Core2D.Image2D], function (image) {
                                    pixelsToWorldUnits = image.pixelsToWorldUnits;
                                    pixelSize = image.imagePixelSize;
                                });
                            });
                            // Assign the grabbed value
                            _this.world.usingComponentData(streamSprite, [ut.Core2D.Sprite2D], function (sprite) {
                                _this.world.usingComponentData(sprite.image, [ut.Core2D.Image2D], function (image) {
                                    image.pixelsToWorldUnits = pixelsToWorldUnits;
                                    image.imagePixelSize = pixelSize;
                                });
                            });
                            renderer.sprite = streamSprite;
                        });
                        return "break";
                    }
                };
                for (var i = 0; i < lengthSprites; i++) {
                    var state_1 = _loop_1(i);
                    if (state_1 === "break")
                        break;
                }
            });
        };
        // Create a good method on this topic
        Service.mouseButtonDownOnEntity = function () {
            if (ut.Core2D.Input.getMouseButtonDown(0)) {
                var mousePos = ut.Core2D.Input.getWorldInputPosition(this.world);
                var hit = ut.HitBox2D.HitBox2DService.hitTest(game.Service.world, mousePos, game.Service.camera);
                if (!hit.entityHit.isNone()) {
                    return hit.entityHit;
                }
            }
            return ut.NONE;
        };
        // Create a good method on this topic
        Service.mouseButtonOnEntity = function () {
            if (ut.Core2D.Input.isTouchSupported() && ut.Core2D.Input.touchCount() > 0) {
                var touch = ut.Core2D.Input.getTouch(0);
                // switch(touch.phase) {
                // case ut.Core2D.TouchState.Moved :
                var touchPos = app.Service.TransformService.getUniversalTouchWorldPosition();
                var hit = ut.HitBox2D.HitBox2DService.hitTest(game.Service.world, touchPos, game.Service.camera);
                if (!hit.entityHit.isNone())
                    return hit.entityHit;
                // break
                // }
            }
            else if (ut.Core2D.Input.getMouseButton(0)) {
                var mousePos = ut.Core2D.Input.getWorldInputPosition(this.world);
                var hit = ut.HitBox2D.HitBox2DService.hitTest(game.Service.world, mousePos, game.Service.camera);
                if (!hit.entityHit.isNone())
                    return hit.entityHit;
            }
            return ut.NONE;
        };
        Service = __decorate([
            ut.requiredComponents(game.Record)
        ], Service);
        return Service;
    }());
    game.Service = Service;
})(game || (game = {}));
var ut;
(function (ut) {
    var EntityGroup = /** @class */ (function () {
        function EntityGroup() {
        }
        /**
         * @method
         * @desc Creates a new instance of the given entity group by name and returns all entities
         * @param {ut.World} world - The world to add to
         * @param {string} name - The fully qualified name of the entity group
         * @returns Flat list of all created entities
         */
        EntityGroup.instantiate = function (world, name) {
            var data = this.getEntityGroupData(name);
            if (data == undefined)
                throw "ut.EntityGroup.instantiate: No 'EntityGroup' was found with the name '" + name + "'";
            return data.load(world);
        };
        ;
        /**
         * @method
         * @desc Destroys all entities that were instantated with the given group name
         * @param {ut.World} world - The world to destroy from
         * @param {string} name - The fully qualified name of the entity group
         */
        EntityGroup.destroyAll = function (world, name) {
            var type = this.getEntityGroupData(name).Component;
            world.forEach([ut.Entity, type], function (entity, instance) {
                // @TODO This should REALLY not be necessary
                // We are protecting against duplicate calls to `destroyAllEntityGroups` within an iteration
                if (world.exists(entity)) {
                    world.destroyEntity(entity);
                }
            });
        };
        /**
         * @method
         * @desc Returns an entity group object by name
         * @param {string} name - Fully qualified group name
         */
        EntityGroup.getEntityGroupData = function (name) {
            var parts = name.split('.');
            if (parts.length < 2)
                throw "ut.Streaming.StreamingService.getEntityGroupData: name entry is invalid";
            var shiftedParts = parts.shift();
            var initialData = entities[shiftedParts];
            if (initialData == undefined)
                throw "ut.Streaming.StreamingService.getEntityGroupData: name entry is invalid";
            return parts.reduce(function (v, p) {
                return v[p];
            }, initialData);
        };
        return EntityGroup;
    }());
    ut.EntityGroup = EntityGroup;
})(ut || (ut = {}));
var ut;
(function (ut) {
    var EntityLookupCache = /** @class */ (function () {
        function EntityLookupCache() {
        }
        EntityLookupCache.getByName = function (world, name) {
            var entity;
            if (name in this._cache) {
                entity = this._cache[name];
                if (world.exists(entity))
                    return entity;
            }
            entity = world.getEntityByName(name);
            this._cache[name] = entity;
            return entity;
        };
        EntityLookupCache._cache = {};
        return EntityLookupCache;
    }());
    ut.EntityLookupCache = EntityLookupCache;
})(ut || (ut = {}));
//# sourceMappingURL=tsc-emit.js.map