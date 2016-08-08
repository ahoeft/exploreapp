//declare myApp
var myApp = angular.module('myApp', []);

myApp.controller('mainController', function($scope, $timeout, $sce) {
	//initialize game
  $scope.combatInfo = $sce.trustAsHtml("Combat Begins! <br>");
  $scope.overlandLog = $sce.trustAsHtml("Welcome to Explore App! <br>");
  $scope.activeView = 'main';
  $scope.game = {};
  $scope.game.clock = "8am";
  $scope.game.night = "day";
  $scope.game.day = 0;
  $scope.game.turn = 1;
  $scope.game.inventory = [];
  $scope.game.beastiary = [];
  $scope.game.availableRecipes = [];
  $scope.game.equipables = [];
  $scope.game.lairs = [];
  $scope.combatItems = [];
  $scope.projectile = {};
  $scope.specialMovesDB = [
    {
      name: "smash",
      highlight: function() {
        highlightBasicAttack(1);
      },
      perform: function (tile) {
        var tileFound = findTile(tile);
        if(tileFound) {
          //find the enemyindex
          var enemyIndex = findEnemyIndex(tile);
          //damage the enemy
          if(enemyIndex) {
            var characterIndex = findCharacterIndex();
            $scope.game.characters[characterIndex].manaSpent++;
            //find positions
            var enemyLeft = $scope.game.enemies[enemyIndex].left;
            var enemyTop = $scope.game.enemies[enemyIndex].top;
            var characterLeft = $scope.game.characters[characterIndex].left;
            var characterTop = $scope.game.characters[characterIndex].top;
            var targetLeft = 0, targetTop = 0;
            if(characterLeft > enemyLeft) {
              targetLeft = $scope.game.enemies[enemyIndex].left - 50;
            }
            if(characterTop > enemyTop) {
              targetTop = $scope.game.enemies[enemyIndex].top - 50;
            }
            if(characterLeft < enemyLeft) {
              targetLeft = $scope.game.enemies[enemyIndex].left + 50;
            }
            if(characterTop < enemyTop) {
              targetTop = $scope.game.enemies[enemyIndex].top + 50;
            }
            var position = { left: targetLeft, top: targetTop };
            if(!occupiedByObstacle(position) && !occupiedByCharacter(position) && !occupiedByEnemy(position) && isOnTheBoard(position)) {
              $scope.game.enemies[enemyIndex].left = targetLeft;
              $scope.game.enemies[enemyIndex].top = targetTop;
            }
            logCombatInfo($scope.game.characters[characterIndex].name + " uses smash.  The enemy falls backwards! <br>");
            damageEnemy(enemyIndex, 2);
          } else {
            logCombatInfo("No enemy in that square, try again! <br>");
          }
        }
      },
      manaCost: 1
    },
    {
      name: "rend",
      highlight: function() {
        highlightBasicAttack(1);
      },
      perform: function(tile) {
        var characterIndex = findCharacterIndex();
        var tileFound = findTile(tile);
        if(tileFound) {
          var enemyIndex = findEnemyIndex(tile);
          if(enemyIndex) {
            $scope.game.characters[characterIndex].manaSpent++;
            damageEnemy(enemyIndex, 1);
            $scope.game.enemies[enemyIndex].bleeding += 2;
            logCombatInfo($scope.game.characters[characterIndex].name + "uses rend.  The " + $scope.game.enemies[enemyIndex].name + " begins to bleed!");
          }
        } else {
            logCombatInfo("No enemy in that square, try again! <br>");
        }
      },
      manaCost: 1
    },
    {
      name: "regen",
      highlight: function() {
        var characterIndex = findCharacterIndex();
        for(var i in $scope.game.combatTiles) {
          if($scope.game.combatTiles[i].top == $scope.game.characters[characterIndex].top && $scope.game.combatTiles[i].left == $scope.game.characters[characterIndex].left) {
            $scope.game.combatTiles[i].class += "Attack";
          }
        }
      },
      perform: function(tile) {
        var characterIndex = findCharacterIndex();
        $scope.game.characters[characterIndex].manaSpent += 2;
        clearCombatTiles();
        var characterIndex = findCharacterIndex();
        var regenVal = Math.floor(($scope.game.characters[characterIndex].int + $scope.game.characters[characterIndex].str )/ 2);
        $scope.game.characters[characterIndex].regen = regenVal;
        logCombatInfo($scope.game.characters[characterIndex].name + " uses regen.  " + $scope.game.characters[characterIndex].name + "'s wounds begin to heal. <br>");
        $scope.hasAttacked = true;
      },
      manaCost: 2
    },
    {
      name: "called shot",
      highlight: function() {
        highlightBasicAttack(3);
      },
      perform: function(tile) {
        var characterIndex = findCharacterIndex();
        var enemyIndex = findEnemyIndex(tile);
        if(enemyIndex) {
          $scope.game.characters[characterIndex].manaSpent++;
          animateCharacterRangedAttack(tile, characterIndex, enemyIndex, function() {
            $scope.showProjectile = false;
            var randomPercent = getRandomPercent();
            if(randomPercent > 50) {
              logCombatInfo($scope.game.characters[characterIndex].name + "'s called shot hits for massive damage! <br>");
              damageEnemy(enemyIndex, 3);
            } else {
              logCombatInfo($scope.game.characters[characterIndex].name + "'s called shot wiffs! <br>");
              $scope.hasAttacked = true;
            }
          });
        } else {
          logCombatInfo("No enemy found, try again! <br>");
        }
      },
      manaCost: 1
    }
  ];
  $scope.recipeDB = [
    { name: "glass", requiredItems: "2 sand ", itemType: "material", img: "./images/glass.png", description: "A brittle crafting material.  It requires a furnace." }, 
    { name: "sandstone", requiredItems: "2 sand ", itemType: "material", img: "./images/sandstone.png", description: "A useful but hard crafting material." },
    { name: "carapace", requiredItems: "2 shell ", itemType: "material", img: "./images/carapace.png", description: "The hard exoskeleton of some beast." },
    { name: "sandstone hut", requiredItems: "5 sandstone ", itemType: "structure", img: "./images/sandstonehut.png", description: "This structure will protect you from monsters at night!" },
    { name: "glass shank", requiredItems: "1 gel & 1 glass ", itemType: "weapon", img: "./images/glassshank.png", description: "A sharp chunk of glass that will make your enemies bleed.", damage: 4, range: 1, specialMoves: [ "rend" ]},
    { name: "driftwood wand", requiredItems: "1 driftwood & 1 pearl ", itemType: "weapon", img: "./images/driftwoodwand.png", description: "A magical wand used for blasting enemies!", damage: 3, range: 3, projectileClass: "Energywave", specialMoves: [ "fireblast" ]},
    { name: "glass spear", requiredItems: "1 carapace & 1 glass ", itemType: "weapon", img: "./images/glassspear.png", description: "A shortspear imbued with holy power.", damage: 4, range: 1, specialMoves: [ "regen" ]},
    { name: "beach pipe", requiredItems: "1 glass & 1 gel ", itemType: "weapon", img: "./images/beachpipe.png", description: "A short ranged blowgun, useful for those who want to control the battlefield.", damage: 3, range: 3, projectileClass: "Dart", specialMoves: [ "poison cloud" ]},
    { name: "beatin' stick", requiredItems: "1 driftwood & 1 carapace ", itemType: "weapon", img: "./images/beatinstick.png", description: "A thick wooden club for smashing enemies.", damage: 4, range: 1, specialMoves: [ "smash" ]},
    { name: "crude bow", requiredItems: "1 driftwood & 1 gel ", itemType: "weapon", img: "./images/crudebow.png", description: "A simple ranged weapon for the dextrous.", damage: 3, range: 3, projectileClass: "Arrow", specialMoves: [ "called shot" ]},
    { name: "shell armor", requiredItems: "2 gel & 2 shell ", itemType: "armor", img: "./images/shellarmor.png", description: "This lightweight armor helps new islanders survive.", bonusHealth: 2, bonusSpeed: 0, bonusMana: 0 },
    { name: "carapace armor", requiredItems: "2 gel & 2 carapace ", itemType: "armor", img: "./images/carapacearmor.png", description: "This heavy armor protects its wearer at the cost of speed.", bonusHealth: 4, bonusSpeed: -1, bonusMana: 0},
    { name: "pearl", requiredItems: "5 clam ", itemType: "material", img: "./images/pearl.png", description: "A shiney pearl.  This is useful for crafting magical things."},
    { name: "sandy salve", requiredItems: "1 sand & 1 gel ", itemType: "combatHeal", img: "./images/sandysalve.png", description: "Just... rub some dirt in that wound.", heal: 4},
    { name: "sandy salvo", requiredItems: "1 sand & 1 carapace ", itemType: "combatHarm", img: "./images/sandysalvo.png", description: "Ouch! Sand in the eyes! Thats gotta sting.", damage: 4, radius: 1, range: 1},
    { name: "quick boots", requiredItems: "1 sand & 1 slime ", itemType: "boots", img: "./images/quickboots.png", description: "Feel the need, for speed!", bonusHealth: 0, bonusMana: 0, bonusSpeed: 1},
    { name: "sturdy boots", requiredItems: "1 sand & 1 gel ", itemType: "boots", img: "./images/sturdyboots.png", description: "Solid quality.  These will last you awhile.", bonusHealth: 2, bonusMana: 0, bonusSpeed: 0},
    { name: "magi boots", requiredItems: "1 sand & 1 pudding ", itemType: "boots", img: "./images/magiboots.png", description: "Magic flows through your tippy toes.", bonusHealth: 0, bonusMana: 2, bonusSpeed: 0},
    { name: "gel", requiredItems: "2 slime ", itemType: "material", img: "./images/gel.png", description: "A sticky crafting material." },
    { name: "gel", requiredItems: "2 pudding ", itemType: "material", img: "./images/gel.png", description: "A sticky crafting material." },
    { name: "slime", requiredItems: "2 gel ", itemType: "material", img: "./images/slime.png", description: "A slimey crafting material." },
    { name: "slime", requiredItems: "2 pudding ", itemType: "material", img: "./images/slime.png", description: "A slimey crafting material." },
    { name: "pudding", requiredItems: "2 slime ", itemType: "material", img: "./images/pudding.png", description: "A tasty crafting material." },
    { name: "pudding", requiredItems: "2 gel ", itemType: "material", img: "./images/pudding.png", description: "A tasty crafting material." },
  ];//ToDo add sandy salve image; add sandy salvo image; add driftwood wand image;
  //starting items to test with
  $scope.game.inventory.push({ name: "crude bow", type: "weapon", img: "./images/crudebow.png", description: "A simple ranged weapon for the dextrous.", damage: 3, range: 3, projectileClass: "Arrow", specialMoves: [ "called shot" ]});
  $scope.game.inventory.push({ 
    name: "beach pipe", 
    type: "weapon", 
    img: "./images/beachpipe.png", 
    description: "A short ranged blowgun, useful for those who want to control the battlefield.", 
    damage: 3, 
    range: 3, 
    projectileClass: "Dart", 
    specialMoves: ["poison cloud" ]
  });
  $scope.game.inventory.push({ 
    name: "driftwood wand", 
    type: "weapon", 
    img: "./images/driftwoodwand.png", 
    description: "A magical wand used for blasting enemies!", 
    damage: 3, 
    range: 3, 
    projectileClass: "Energywave", 
    specialMoves: ["fireblast" ]
  });
  $scope.game.inventory.push({ 
    name: "glass spear",  
    type: "weapon", 
    img: "./images/glassspear.png", 
    description: "A shortspear imbued with holy power.", 
    damage: 4, 
    range: 1, 
    specialMoves: [ "regen" ]
});
  
  $scope.droppableItems = [
    { name: "gel", img: "./images/gel.png", type:"material", description: "A sticky crafting material." },
    { name: "carapace", img: "./images/carapace.png", type:"material", description: "The hard exoskeleton of some beast." },
    { name: "pearl", img: "./images/pearl.png", type:"material", description: "A beautiful gem said to be the tear of an angel." },
    { name: "slime", img: "./image/slime.png", type: "material", description: "Yuck! It reminds you of boogers."},
    { name: "pudding", img: "./image/pudding.png", type: "material", description: "Hmm, strange pink pudding. What can you use this for?"},
    { name: "slime staff", img: "./images/slimestaff.png", type: "weapon", description: "A staff of wondrous slimey power!", damage: 6, range: 3, projectileClass: "slimeblob", specialMoves: [ "slimeblast" ] },
    { name: "pudding axe", img:"./images/puddingaxe.png", type: "weapon", description: "A pink axe dripping with deadly... pudding?", damage: 6, range: 1, specialMoves: ["smash"]},
    { name: "slime robe", img: "./images/slimerobe.png", type: "armor", description: "Slimey, yet strangely comfy.", bonusHealth: 0, bonusMana: 5, bonusSpeed: 0}
  ];

  var isOnTheBoard = function (position) {
    var onTheBoard = false;
    if(position.left >= 250 && position.left <= 700 && position.top >= 100 && position.top <= 550) {
      onTheBoard = true;
    }
    return onTheBoard;
  };

  var addToInventory = function(item) {
    if($scope.game.inventory >= $scope.game.capacity) {
      logOverlandInfo("Inventory full, could not add item. <br>");
      logCombatInfo("Inventory full, could not add item. <br>");
    } else {
      $scope.game.inventory.push(item);
    }
  };

  var highlightBasicAttack = function (range) {
    var activePlayerIndex = findCharacterIndex();
        var activePlayer = $scope.game.characters[activePlayerIndex];
        var maxDistance = 50 * range;
        //highlight tiles to click
        $scope.game.tilesToHighlight = [];
        for(var i in $scope.game.combatTiles) {
          var tileLeft = $scope.game.combatTiles[i].left;
          var tileTop = $scope.game.combatTiles[i].top;
          var position = {left: tileLeft, top: tileTop};
          var distanceToTile = findDistance(position, activePlayer);
          if( distanceToTile <= maxDistance ) {
            if(!occupiedByObstacle(position)  && !occupiedByCharacter(position)) {
              $scope.game.combatTiles[i].class += "Attack";
              $scope.game.tilesToHighlight.push($scope.game.combatTiles[i]);
            }
          }
        }
  };

  var logOverlandInfo = function (htmlString) {
    $scope.overlandLog = $sce.trustAsHtml($scope.overlandLog + htmlString);
  };
  
  var logCombatInfo = function (htmlString) {
    $scope.combatInfo = $sce.trustAsHtml($scope.combatInfo + htmlString);
    scrollToBottom();
  };

  var clearCombatLog = function () {
    $scope.combatInfo = $sce.trustAsHtml("You have been waylaid by enemies! <br>");
  };

  var createTeam = function() {
      //initialize team
      $scope.game.team = {};
      $scope.game.team.top = 150;
      $scope.game.team.left = 300;
      $scope.game.team.capacity = 30;
      $scope.game.team.location = "beach";
  };

  var createCharacters = function() {
    $scope.game.characters = [
      { name: "Spike", class: "avatar1", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, bonusSpeed: 0, bonusMana: 0 }, range: 1 },
      { name: "Albert", class: "avatar2", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, bonusSpeed: 0, bonusMana: 0 }, range: 1 },
      { name: "Sandra", class: "avatar3", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, bonusSpeed: 0, bonusMana: 0 }, range: 1 },
      { name: "Coco", class: "avatar4", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, bonusSpeed: 0, bonusMana: 0 }, range: 1 }
    ];
  };

  var nextTurn = function () {
    $scope.game.turn++;
    if($scope.game.turn % 8 == 0) {
      $scope.game.clock = "5am";
    }
    if($scope.game.turn % 8 == 1) {
      $scope.game.clock = "8am";
      $scope.game.night = "day";
      logOverlandInfo("The dawn breaks anew! <br>");
      $scope.game.day++;
    }
    if($scope.game.turn % 8 == 2) {
      $scope.game.clock = "11am";
    }
    if($scope.game.turn % 8 == 3) {
      $scope.game.clock = "2pm";
    }
    if($scope.game.turn % 8 == 4) {
      $scope.game.clock = "5pm";
    }
    if($scope.game.turn % 8 == 5) {
      $scope.game.clock = "8pm";
      $scope.game.night = "night";
      logOverlandInfo("Night falls, and things begin to crawl around. <br>");
    }
    if($scope.game.turn % 8 == 6) {
      $scope.game.clock = "11pm";
    }
    if($scope.game.turn % 8 == 7) {
      $scope.game.clock = "2am";
    }
    $scope.infoHover('clear');
  };

  var checkIfLairExists = function () {
    var lairExists = false;
    for(var i in $scope.game.lairs) {
      if($scope.game.lairs[i].top == $scope.game.team.top && $scope.game.lairs[i].left == $scope.game.team.left) {
        lairExists = true;
        $scope.currentLair = $scope.game.lairs[i];
        break;
      }
    }
    return lairExists;
  };

  var foundLair = function () {
    //check if lair exists
    var lairExists = checkIfLairExists();
    if(!lairExists) {
      logOverlandInfo("You found a lair! <br>");
      var lair = {
        left: $scope.game.team.left,
        top: $scope.game.team.top,
        tile: $scope.game.team.location
      };
      var randomPercent = getRandomPercent();
      if(lair.tile == "beach") {
        if(randomPercent < 100) {
          lair.name = "Slime Pits";
          lair.class = "slimepits";
        } else if (randomPercent < 66) {
          lair.name = "Crabby Cove";
          lair.class = "crabbycove";
        } else {
          lair.name = "Flooded Cave";
          lair.class = "floodedcave";
        }
      } //TODO add images for the above lairs.
      $scope.lairHere = true;
      $scope.game.lairs.push(lair);
    }
  };

  var getRandomPercent = function () {
    return Math.round(Math.random() * 99) + 1;
  };

  var harvestBeach = function() {
    var item = {};
    var randomPercent = getRandomPercent();
    var randomAmount = Math.round(Math.random() * 2) + 1;
    if(randomPercent < 10) {
      item = undefined;
    } else if (randomPercent < 40) {
      item = { name: "sand", img: "./images/sand.png", type:"material", description: "A useful material for crafting." };
    } else if (randomPercent < 65) {
      item = { name: "shell", img: "./images/shell.png", type:"material", description: "A useful material for crafting." };
    } else if (randomPercent < 90) {
      item = { name: "driftwood", img: "./images/driftwood.png", type:"material", description: "A useful material for crafting." };
    } else {
      item = { name: "clam", img: "./images/clam.png", type:"material", description: "A useful material for crafting." };
    }
    if(item) {
      for(var i = 0; i < randomAmount; i++) {
        addToInventory(item);
      }
      logOverlandInfo("You successfully harvest " + randomAmount + " " + item.name + ". <br>");
      var randomLairChance = getRandomPercent();
      if(randomLairChance < 25) {
        foundLair();
      }
    } else {
      logOverlandInfo("You search for hours but find nothing. <br>");
    } 
  };

  var drawEncounterMap = function (lair) {
    var id = 1;
    $scope.game.combatTiles = [];
    for (var i = 0; i < 10; i++) {
      for(var q = 0; q < 10; q++) {
        var tile = {};
        tile.column = q;
        tile.row = i;
        if(lair) {
          tile.class = lair.class;
        } else {
          tile.class = $scope.game.team.location;
        }
        
        tile.top = (tile.row * 50) + 100;
        tile.left = (tile.column * 50) + 250;
        tile.id = id;
        id++;
        $scope.game.combatTiles.push(tile);
      }
    }
  };

  var drawCharacters = function () {
    //Set all characters to off the board
    for(var i in $scope.game.characters) {
      $scope.game.characters[i].top = 50;
      $scope.game.characters[i].left = 200;
      $scope.game.characters[i].damageTaken = 0;
      $scope.game.characters[i].manaSpent = 0;
      $scope.game.characters[i].movesTaken = 0;
    }
  };

  var occupiedByEnemy = function (unoccupiedPosition) {
    var occupied = false;
    //loop through enemies
    for(var e in $scope.game.enemies) {
      if(unoccupiedPosition.top == $scope.game.enemies[e].top && unoccupiedPosition.left == $scope.game.enemies[e].left) {
        occupied = true;
      }
    }
    return occupied;
  };

  var occupiedByCharacter = function (unoccupiedPosition) {
    var occupied = false;
    //loop through enemies
    for(var c in $scope.game.characters) {
      if(unoccupiedPosition.top == $scope.game.characters[c].top && unoccupiedPosition.left == $scope.game.characters[c].left) {
        occupied = true;
      }
    }
    return occupied;
  };

  var occupiedByObstacle = function (unoccupiedPosition) {
    var occupied = false;
    //loop through obstacles
    for(var h in $scope.game.obstacles) {
      if(unoccupiedPosition.top == $scope.game.obstacles[h].top && unoccupiedPosition.left == $scope.game.obstacles[h].left) {
        occupied = true;
      }
    }
    return occupied;
  }

  var findUnoccupiedPosition = function () {
    var unoccupiedPosition = { top: 50 * (Math.round(Math.random() * 9)) + 100, left: 50 * (Math.round(Math.random() * 9)) + 250};
    //loop through enemies
    var positionOccupied = occupiedByEnemy(unoccupiedPosition);
    
    //loop through characters
    for(var c in $scope.game.characters) {
      if(unoccupiedPosition.top == $scope.game.characters[c].top && unoccupiedPosition.left == $scope.game.characters[c].left) {
        positionOccupied = true;
      }
    }
    //loop through obstacle
    for(var h in $scope.game.obstacles) {
      if(unoccupiedPosition.top == $scope.game.obstacles[h].top && unoccupiedPosition.left == $scope.game.obstacles[h].left) {
        positionOccupied = true;
      }
    }
    if(positionOccupied) {
      return findUnoccupiedPosition();
    } else {
      return unoccupiedPosition;
    }
  };

  var replaceTile = function(hazard) {
    for(var i in $scope.game.combatTiles) {
      if($scope.game.combatTiles[i].left == hazard.left && $scope.game.combatTiles[i].top == hazard.top) {
        $scope.game.combatTiles[i].class = hazard.class;
        break;
      }
    }
  };

  var positionCombatants = function () {
    //first place enemies
    for(var e in $scope.game.enemies) {
      var unoccupiedPosition = findUnoccupiedPosition();
      $scope.game.enemies[e].left = unoccupiedPosition.left;
      $scope.game.enemies[e].top = unoccupiedPosition.top;
    }
    
    //then place characters
    for(var c in $scope.game.characters) {
      var unoccupiedPosition = findUnoccupiedPosition();
      $scope.game.characters[c].left = unoccupiedPosition.left;
      $scope.game.characters[c].top = unoccupiedPosition.top;
    }
    //then place obstacles
    for(var h in $scope.game.obstacles) {
      var unoccupiedPosition = findUnoccupiedPosition();
      $scope.game.obstacles[h].left = unoccupiedPosition.left;
      $scope.game.obstacles[h].top = unoccupiedPosition.top;
    }
    //finally place hazards
    for(var h in $scope.game.hazards) {
      var unoccupiedPosition = findUnoccupiedPosition();
      $scope.game.hazards[h].left = unoccupiedPosition.left;
      $scope.game.hazards[h].top = unoccupiedPosition.top;
      replaceTile($scope.game.hazards[h]);
    }
  };

  var fetchRandomEnemy = function (lair) {
    var enemy = {};
    var randomPercent = getRandomPercent();
    if(lair) {
      if(lair.class == "slimepits") {
        if(randomPercent < 33) {
            enemy = { 
              name: "Blue Jelly",
              class: "bluejelly",
              health: 4,
              mana: 1,
              str: 2,
              dex: 2,
              int: 2,
              damage: 3,
              speed: 2,
              xp: 30,
              drops: "1 gel ",
              range: 1 
          };
        } else if (randomPercent < 66) {
          enemy = {
            name: "Green Slime",
            class: "greenslime",
            health: 8,
            mana: 1,
            str: 2,
            dex: 6,
            int: 2,
            damage: 4,
            speed: 2,
            xp: 40,
            drops: "1 slime ",
            range: 3,
            projectile: "slimeblob"
          };
        } else {
          enemy = {
            name: "Pink Pudding",
            class: "pinkpudding",
            health: 12,
            mana: 1,
            str: 6,
            dex: 2,
            int: 2,
            damage: 4,
            speed: 2,
            xp: 40,
            drops: "1 pudding ",
            range: 1
          };
        }
      }
    } else {
      if($scope.game.team.location == "beach") {
        if(randomPercent < 33) {
          enemy = {
            name: "Giant Crab",
            class: "crab",
            health: 6,
            mana: 1,
            str: 2,
            dex: 2,
            int: 2,
            damage: 2,
            speed: 2,
            xp: 30,
            drops: "1 carapace ",
            range: 1
        };
      } else if(randomPercent < 66) {
        enemy = { 
          name: "Blue Jelly",
          class: "bluejelly",
          health: 4,
          mana: 1,
          str: 2,
          dex: 2,
          int: 2,
          damage: 3,
          speed: 2,
          xp: 30,
          drops: "1 gel ",
          range: 1 
        };
      } else {
          enemy = { 
            name: "Baspica",
            class: "baspica",
            health: 4,
            mana: 1,
            str: 2,
            dex: 2,
            int: 2,
            damage: 3,
            speed: 0,
            xp: 40,
            drops: "1 pearl ",
            range: 3,
            projectile: "pearlshot" 
          };
        }
      }
    }
    return enemy;
  }

  var drawEnemies = function (lair) {
    $scope.game.enemies = [];
    var numEnemies = Math.round(Math.random() * 4) + 1;
    if($scope.game.night == "night") {
      numEnemies = numEnemies + 2;
    }
    for(var n = 0; n < numEnemies; n++) {
      var enemy = fetchRandomEnemy(lair);
      //set position to off the board
      enemy.name += " " + (n + 1);
      enemy.top = 50;
      enemy.left = 200;
      enemy.damageTaken = 0;
      enemy.bleeding = 0;
      $scope.game.enemies.push(enemy);
    }
  };

  var rollInitiative = function () {
    $scope.turnOrder = [];
    //add characters
    for(var c in $scope.game.characters) {
      $scope.game.characters[c].initiative = Math.round(Math.random() * 20) + $scope.game.characters[c].dex;
      var turn = {};
      turn.name = $scope.game.characters[c].name;
      turn.initiative = $scope.game.characters[c].initiative;
      turn.type = "character";
      turn.class = $scope.game.characters[c].class;
      turn.isDead = false;
      $scope.turnOrder.push(turn);
    }
    //add enemies
    for(var e in $scope.game.enemies) {
      $scope.game.enemies[e].initiative = Math.round(Math.random() * 20) + $scope.game.enemies[e].dex;
      var turn = {};
      turn.name = $scope.game.enemies[e].name;
      turn.initiative = $scope.game.enemies[e].initiative;
      turn.type = "enemy";
      turn.isDead = false;
      turn.class = $scope.game.enemies[e].class;
      $scope.turnOrder.push(turn);
    }
    //sort array largest numbers go first.
    $scope.turnOrder.sort(function(a, b){return b.initiative-a.initiative});
    $scope.activeTurnIndex = 0;
    $scope.activeTurn = $scope.turnOrder[$scope.activeTurnIndex];
  };

  var findClosestCharacterIndex = function (activeEnemy) {
    var characterDistances = [];
    for(c in $scope.game.characters) {
      var isAlive = $scope.game.characters[c].health > $scope.game.characters[c].damageTaken;
      if(isAlive) {
        var x1 = activeEnemy.left;
        var x2 = $scope.game.characters[c].left;
        var y1 = activeEnemy.top;
        var y2 = $scope.game.characters[c].top;
        var d = Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
        var characterDistance = {
          distance: d,
          index: c
        };
        characterDistances.push(characterDistance);
      }
    }
    characterDistances.sort(function(a, b){return a.distance-b.distance});
    return characterDistances[0].index;

  };

  var findClosestPosition = function(targetTile) {
    var positions = [
          {left: $scope.projectile.left - 1, top: $scope.projectile.top, name: "left"},
          {left: $scope.projectile.left + 1, top: $scope.projectile.top, name: "right"},
          {left: $scope.projectile.left, top: $scope.projectile.top - 1, name: "up"},
          {left: $scope.projectile.left, top: $scope.projectile.top + 1, name: "down"}
        ];
    positions.sort(function(a, b) {
          var x1 = targetTile.left;
          var y1 = targetTile.top;
          var a1 = a.left;
          var a2 = a.top;
          var b1 = b.left;
          var b2 = b.top;
     	    var distanceA = Math.sqrt( (x1-a1)*(x1-a1) + (y1-a2)*(y1-a2) );
          var distanceB = Math.sqrt( (x1-b1)*(x1-b1) + (y1-b2)*(y1-b2) );
          return distanceA - distanceB;
        });
    return positions[0];
  };

  var animateEnemyRangedAttack = function (targetCharacterIndex, activeEnemyIndex) {
    $scope.showProjectile = true;
    $scope.projectile.class = $scope.game.enemies[activeEnemyIndex].projectile;
    $scope.projectile.top = $scope.game.enemies[activeEnemyIndex].top;
    $scope.projectile.left = $scope.game.enemies[activeEnemyIndex].left;
    var targetTile = {};
    targetTile.top = $scope.game.characters[targetCharacterIndex].top;
    targetTile.left = $scope.game.characters[targetCharacterIndex].left;
    function moveProjectile(targetTile, targetCharacterIndex, activeEnemyIndex) {
      if(targetTile.top == $scope.projectile.top && targetTile.left == $scope.projectile.left) {
        $scope.showProjectile = false;
        damageCharacter(targetCharacterIndex, activeEnemyIndex);
      } else {
        var closestPosition = findClosestPosition(targetTile);
        $scope.projectile.left = closestPosition.left;
        $scope.projectile.top = closestPosition.top;
        $timeout(function() { moveProjectile(targetTile, targetCharacterIndex, activeEnemyIndex); }, 4);
      }
    };
    $timeout(function() { moveProjectile(targetTile, targetCharacterIndex, activeEnemyIndex); }, 4);
  };

  var checkRange = function (targetCharacterIndex, activeEnemyIndex) {
    var inRange = false;
    var enemyRange = $scope.game.enemies[activeEnemyIndex].range;
    var maxDistance = 50 * enemyRange;
    var distanceToTarget = findDistance($scope.game.characters[targetCharacterIndex], $scope.game.enemies[activeEnemyIndex]);
    if (distanceToTarget <= maxDistance) {
      inRange = true;
    }
    
    return inRange;
  };

  var gameOver = function () {
    $scope.activeView = 'showGameOver';
  };

  var checkTeamStatus = function (targetCharacterIndex) {
    for(var t in $scope.turnOrder) {
        if($scope.game.characters[targetCharacterIndex].name == $scope.turnOrder[t].name) {
          $scope.game.characters[targetCharacterIndex].class = "dead";
          $scope.turnOrder[t].isDead = true;
          break;
        }
      }
      //check if team is dead
      var teamDown = true;
      for(t in $scope.turnOrder) {        
        if($scope.turnOrder[t].isDead == false) {
          teamDown = false;
        }
      }
      if(teamDown) {
        gameOver();
      }
  };

  var damageCharacter = function (targetCharacterIndex, activeEnemyIndex) {
    var baseDamage = Math.round(Math.random() * $scope.game.enemies[activeEnemyIndex].damage);
    var attributeDamage = 0;
    if($scope.game.enemies[activeEnemyIndex].range > 1) {
      attributeDamage = Math.floor($scope.game.enemies[activeEnemyIndex].dex / 2);
    } else {
      attributeDamage = Math.floor($scope.game.enemies[activeEnemyIndex].str / 2);
    }
    var damageDealt = baseDamage + attributeDamage;
    $scope.game.characters[targetCharacterIndex].damageTaken += damageDealt;
    logCombatInfo("<span style='color: red;'>" +$scope.game.enemies[activeEnemyIndex].name + "</span> deals " + damageDealt + " to " + $scope.game.characters[targetCharacterIndex].name + ". <br>");
    if($scope.game.characters[targetCharacterIndex].health <= $scope.game.characters[targetCharacterIndex].damageTaken) {
      //character is Dead
      logCombatInfo($scope.game.characters[targetCharacterIndex].name + " has died! <br>");
      checkTeamStatus(targetCharacterIndex);
    }
    $scope.doNextCombatRound(false);
  };

  var travelToHereCombat = function(tile) {
      var characterIndex = findCharacterIndex();
      
      var tileFound = findTile(tile);
      if(tileFound) {
        $scope.hasMoved = true;
        var character = $scope.game.characters[characterIndex];
        //find valid moves
        $scope.game.validMoves = [];
        var positions = [
          { left: character.left - 50, top: character.top },
          { left: character.left + 50, top: character.top },
          { left: character.left, top: character.top - 50 },
          { left: character.left, top: character.top + 50 }
        ];
        for(var i in positions) {
          if(!occupiedByCharacter(positions[i]) && !occupiedByEnemy(positions[i]) && !occupiedByObstacle(positions[i])) {
            $scope.game.validMoves.push(positions[i]);
          }
        }
        //figure out which move is closer to the target Tile
        $scope.game.validMoves.sort(function(a, b) {
          var x1 = tile.left;
          var y1 = tile.top;
          var a1 = a.left;
          var a2 = a.top;
          var b1 = b.left;
          var b2 = b.top;
     	    var distanceA = Math.sqrt( (x1-a1)*(x1-a1) + (y1-a2)*(y1-a2) );
          var distanceB = Math.sqrt( (x1-b1)*(x1-b1) + (y1-b2)*(y1-b2) );
          return distanceA - distanceB;
        });

        //move there
        function delayMove(characterIndex, tile) {
          if ($scope.game.characters[characterIndex].left == $scope.game.validMoves[0].left && $scope.game.characters[characterIndex].top == $scope.game.validMoves[0].top) {
            $scope.game.characters[characterIndex].movesTaken++;
            //check to see if moves are left
            if($scope.game.characters[characterIndex].movesTaken < $scope.game.characters[characterIndex].speed) {
              if($scope.game.characters[characterIndex].left == tile.left && $scope.game.characters[characterIndex].top == tile.top) {
                clearCombatTiles();
              } else {
                travelToHereCombat(tile);
              }
            } else {
              clearCombatTiles();
            }
          } else {
          if($scope.game.characters[characterIndex].left > $scope.game.validMoves[0].left) {
            $scope.game.characters[characterIndex].left--;
          }
          if($scope.game.characters[characterIndex].left < $scope.game.validMoves[0].left) {
            $scope.game.characters[characterIndex].left++;
          }
          if($scope.game.characters[characterIndex].top > $scope.game.validMoves[0].top) {
            $scope.game.characters[characterIndex].top--;
          }
          if($scope.game.characters[characterIndex].top < $scope.game.validMoves[0].top) {
            $scope.game.characters[characterIndex].top++;
          }
          $timeout(function() { delayMove(characterIndex, tile); }, 20);
        }
      };
      $timeout(function() { delayMove(characterIndex, tile); }, 20);
      }
  };

  var scrollToBottom = function () {
    var objDiv = document.getElementById("c4");
    objDiv.scrollTop = objDiv.scrollHeight;
  };

  var notOccupied = function (tile) {
    var unoccupied = false;
    if(!occupiedByEnemy(tile) && !occupiedByCharacter(tile) && !occupiedByObstacle(tile) && isOnTheBoard(tile)) {
      unoccupied = true;
    }
    return unoccupied;
  }

  var moveEnemy = function (targetCharacterIndex, activeEnemyIndex) {
    //list of valid moves
    $scope.game.validMoves = [];
    var activeEnemy = $scope.game.enemies[activeEnemyIndex];
    var potentialMoves = [
          { left: activeEnemy.left - 50, top: activeEnemy.top },
          { left: activeEnemy.left + 50, top: activeEnemy.top },
          { left: activeEnemy.left, top: activeEnemy.top - 50 },
          { left: activeEnemy.left, top: activeEnemy.top + 50 }
        ];
    for(var i in potentialMoves) {
      if(notOccupied(potentialMoves[i])) {
        $scope.game.validMoves.push(potentialMoves[i]);
      }
    }
    if($scope.game.validMoves.length < 1) {
      $scope.doNextCombatRound(false);
    }
    //figure out which move is closer to the character
    $scope.game.validMoves.sort(function(a, b) {
      var x1 = $scope.game.characters[targetCharacterIndex].left;
      var y1 = $scope.game.characters[targetCharacterIndex].top;
      var a1 = a.left;
      var a2 = a.top;
      var b1 = b.left;
      var b2 = b.top;
      var distanceA = Math.sqrt( (x1-a1)*(x1-a1) + (y1-a2)*(y1-a2) );
      var distanceB = Math.sqrt( (x1-b1)*(x1-b1) + (y1-b2)*(y1-b2) );
      return distanceA - distanceB;
    });
    //move there
    function delayMove(activeEnemyIndex) {
      if ($scope.game.enemies[activeEnemyIndex].left == $scope.game.validMoves[0].left && $scope.game.enemies[activeEnemyIndex].top == $scope.game.validMoves[0].top) {
        $scope.game.enemies[activeEnemyIndex].movesTaken++;
        doEnemyTurn();
      } else {
        if($scope.game.enemies[activeEnemyIndex].left > $scope.game.validMoves[0].left) {
          $scope.game.enemies[activeEnemyIndex].left--;
        }
        if($scope.game.enemies[activeEnemyIndex].left < $scope.game.validMoves[0].left) {
          $scope.game.enemies[activeEnemyIndex].left++;
        }
        if($scope.game.enemies[activeEnemyIndex].top > $scope.game.validMoves[0].top) {
          $scope.game.enemies[activeEnemyIndex].top--;
        }
        if($scope.game.enemies[activeEnemyIndex].top < $scope.game.validMoves[0].top) {
          $scope.game.enemies[activeEnemyIndex].top++;
        }
        $timeout(function() { delayMove(activeEnemyIndex); }, 20);
      }
    };
    $timeout(function() { delayMove(activeEnemyIndex); }, 20);
  };

  var doEnemyTurn = function () {
    var activeEnemy = {};
    var activeEnemyIndex = 0;
    for(e in $scope.game.enemies) {
      if($scope.activeTurn.name == $scope.game.enemies[e].name) {
        activeEnemy = $scope.game.enemies[e];
        activeEnemyIndex = e;
        break;
      }
    }
    //find closest player
    var targetCharacterIndex = findClosestCharacterIndex(activeEnemy);
    //check if in attack range
    var inRange = checkRange(targetCharacterIndex, activeEnemyIndex);
    //if in range attack then end turn
    if(inRange) {
      if($scope.game.enemies[activeEnemyIndex].range > 1) {
        animateEnemyRangedAttack(targetCharacterIndex, activeEnemyIndex);
      } else {
        damageCharacter(targetCharacterIndex, activeEnemyIndex);
      }
    } else {
      if($scope.game.enemies[activeEnemyIndex].movesTaken < $scope.game.enemies[activeEnemyIndex].speed) {
        moveEnemy(targetCharacterIndex, activeEnemyIndex);
      } else {
        $scope.doNextCombatRound(false);
      }
    }
  };

  var startEnemyTurn = function () {
    if($scope.activeTurn.isDead == false) {
      var activeEnemyIndex = 0;
      for(e in $scope.game.enemies) {
        if($scope.activeTurn.name == $scope.game.enemies[e].name) {
          activeEnemyIndex = e;
          break;
        }
      }
      if($scope.game.enemies[activeEnemyIndex].bleeding > 0) {
        $scope.game.enemies[activeEnemyIndex].damageTaken += $scope.game.enemies[activeEnemyIndex].bleeding;
        logCombatInfo($scope.game.enemies[activeEnemyIndex].name + " bleeds for " + $scope.game.enemies[activeEnemyIndex].bleeding + " damage. <br>");
          if($scope.game.enemies[activeEnemyIndex].damageTaken >= $scope.game.enemies[activeEnemyIndex].health) {
            logCombatInfo($scope.game.enemies[activeEnemyIndex].name + " has bled to death. <br>");
            dropLoot(enemyIndex);
            $scope.turnOrder[turnToRemove].isDead = true;
            $scope.turnOrder[turnToRemove].class = "dead";
            $scope.game.enemies.splice(enemyIndex, 1);
            if($scope.game.enemies.length < 1) {
              endCombat();
            }
          }
      }
      var hazard = checkForHazard($scope.game.enemies[activeEnemyIndex]);
      if(hazard) {
        hazard.resolve(false);
      }
    }
  };

  var checkForHazard = function(position) {
    var hazard = undefined;
    for(var i in $scope.game.hazards) {
      if(position.left == $scope.game.hazards[i].left && position.top == $scope.game.hazards[i].top) {
        hazard = $scope.game.hazards[i];
      }
    }
    return hazard;
  };

  var startCharacterTurn = function() {
    var characterIndex = findCharacterIndex();
    $scope.hasAttacked = false;
    $scope.hasMoved = false;
    for(var c in $scope.game.characters) {
      if($scope.activeTurn.name == $scope.game.characters[c].name) {
        $scope.game.characters[c].movesTaken = 0;
      }
    }
    //check regen
    if($scope.game.characters[characterIndex].regen && $scope.game.characters[characterIndex].regen > 0) {
      if($scope.game.characters[characterIndex].regen > $scope.game.characters[characterIndex].damageTaken) {
        $scope.game.characters[characterIndex].damageTaken = 0;
      } else {
        $scope.game.characters[characterIndex].damageTaken -= $scope.game.characters[characterIndex].regen;
        logCombatInfo($scope.game.characters[characterIndex].name + " regenerates <span style='color: lightgreen'>" + $scope.game.characters[characterIndex].regen + "</span> health. <br>");
      }
    }
    var hazard = checkForHazard($scope.game.characters[characterIndex]);
    if(hazard) {
      hazard.resolve(true);
    }
  };

  $scope.doNextCombatRound = function (startingRound) {
    clearCombatTiles($scope.activeTurnIndex);
    if(startingRound == false) {
          if($scope.activeTurnIndex == $scope.turnOrder.length - 1) {
            $scope.activeTurnIndex = 0;
          } else {
            $scope.activeTurnIndex++;
          }
          $scope.activeTurn = $scope.turnOrder[$scope.activeTurnIndex];
    }

    //Check if it is an enemies turn
    if($scope.activeTurn.type == "enemy") {
      startEnemyTurn();
      if($scope.activeTurn.isDead == false) {
        //clear enemy moves
        for(e in $scope.game.enemies) {
          if($scope.activeTurn.name == $scope.game.enemies[e].name) {
            $scope.game.enemies[e].movesTaken = 0;
            break;
          }
        }      
        doEnemyTurn();
      } else {
        $scope.doNextCombatRound(false);
      }  
    } else {
      //character turn
      if($scope.activeTurn.isDead) {
        $scope.doNextCombatRound(false);
      } else {
        startCharacterTurn();
      }
    }
  };

  var fetchRandomObstacle = function(lair) {
    var obstacle = {};
    var randomPercent = getRandomPercent();
    if(lair) {
      if(lair.class == "slimepits") {
        obstacle.class = "slimerock obstacle";
      }
    } else {
      if("beach" == $scope.game.team.location) {
          
          if(randomPercent < 50) {
            obstacle.class = "rock obstacle";
          } else {
            obstacle.class = "palmtree obstacle";
          }
        }
    }
    return obstacle;
  };

  var drawObstacles = function (lair) {
      $scope.game.obstacles = [];
      var numHazards = Math.round(Math.random() * 10) + 10;
      for(var i = 0; i < numHazards; i++) {
        var obstacle = fetchRandomObstacle(lair);
        obstacle.left = 200;
        obstacle.top = 50;
        $scope.game.obstacles.push(obstacle);
      }
  };

  var fetchRandomHazard = function(lair) {
    var hazard = {};
    if(lair) {
      if(lair.class == "slimepits") {
        hazard.class == "slimepool";
        hazard.resolve = function(characterTurn) {
          if(characterTurn) {
            var characterIndex = findCharacterIndex();
            logCombatInfo($scope.game.characters[characterIndex].name + " steps in slime! <br>");
            var damage = Math.round(Math.random() * 6);
            $scope.game.characters[characterIndex].damageTaken += damage;
            logCombatInfo($scope.game.characters[characterIndex].name + " takes " + damage + " from the pool opf acid. <br>");
            if($scope.game.characters[characterIndex].damageTaken >= $scope.game.characters[characterIndex].health) {
              logCombatInfo($scope.game.characters[targetCharacterIndex].name + " has died! <br>");
              checkTeamStatus(characterIndex);          
            }
          } else {
            var activeEnemyIndex = findEnemyIndex(this);
            logCombatInfo($scope.game.enemies[activeEnemyIndex].name + " steps in slime! <br>");
            var damage = Math.round(Math.random() * 6);
            $scope.game.enemies[activeEnemyIndex].damageTaken += damage;
            logCombatInfo($scope.game.enemies[activeEnemyIndex].name + " takes " + damage + " from the pool opf acid. <br>");
            if($scope.game.enemies[activeEnemyIndex].damageTaken >= $scope.game.enemies[activeEnemyIndex].health) {
              logCombatInfo($scope.game.enemies[activeEnemyIndex].name + " has died! <br>");
              killEnemy(activeEnemyIndex);          
            }
          }
        }
      }
    } else {
      if("beach" == $scope.game.team.location) {
        hazard.class = "sandpit";
        hazard.resolve = function(characterTurn) {
          if(characterTurn) {
            var characterIndex = findCharacterIndex();
            $scope.game.characters[characterIndex].movesTaken++;
            logCombatInfo("The sand pit swirls and " + $scope.game.characters[characterIndex].name + " loses 1 move. <br>");
          } else {
            var activeEnemyIndex = findEnemyIndex(this);
            $scope.game.enemies[activeEnemyIndex].movesTaken++;
            logCombatInfo("The sand pit swirls and " + $scope.game.activeEnemyIndex[activeEnemyIndex].name + " loses 1 move. <br>");
          }
        }
      }
    }
    return hazard;
  };

  var drawHazards = function(lair) {
    $scope.game.hazards = [];
      var numHazards = Math.round(Math.random() * 10);
      for(var i = 0; i < numHazards; i++) {
        var hazard = fetchRandomHazard(lair);
        hazard.left = 200;
        hazard.top = 50;
        $scope.game.hazards.push(hazard);
      }
  };

  var generateEncounter = function() {
    //starting encounter
    $scope.numOfEncounters = 1;
    $scope.encounterTally = 1;
    clearCombatLog();
    drawEncounterMap(undefined);
    drawEnemies(undefined);
    drawCharacters();
    drawObstacles(undefined);
    drawHazards(undefined);
    positionCombatants();
    rollInitiative();
    $scope.showCombatItems = false;
    $scope.showCombatSpecial = false;
    $scope.activeView = 'showCombatView';
    $scope.doNextCombatRound(true);
  };

  var checkForEncounter = function () {
    var randomPercent = getRandomPercent();
    if(randomPercent < 33) {
      generateEncounter();
    }
  };

  $scope.harvest = function() {
      checkForEncounter();
      if("beach" == $scope.game.team.location) harvestBeach();
      nextTurn();
  };

  $scope.viewCrafting = function () {
    $scope.activeView = 'showCraft';
  };
  
  var verifyMaterialInInventory = function (requiredItems) {
    var addMe = false;
    var eachItem = requiredItems.split("& ");
    var itemsFound = 0;
    for(var k in eachItem) {
      var foundEnoughForItem = false;
      var itemNamesAndNumbers = eachItem[k].split(" ");
      var itemNumber = itemNamesAndNumbers[0];
      var itemName = itemNamesAndNumbers[1];
      var foundOne = 0;
      for(var i in $scope.game.inventory) {
        if(itemName == $scope.game.inventory[i].name) {
          foundOne++;
          if(foundOne == itemNumber) {
            foundEnoughForItem = true;
            break;
          }
        }
      }
      if(foundEnoughForItem) {
        itemsFound++;
      }
    }
    if(itemsFound == eachItem.length) {
      addMe = true;
    }
    
    return addMe;
  };

  $scope.selectItemFromInventory = function(item) {
    $scope.game.availableRecipes = [];
    $scope.showEquipables = false;
    for(var i in $scope.recipeDB) {
      if($scope.recipeDB[i].requiredItems.includes(" " + item.name + " ")) {
        var addMe = verifyMaterialInInventory($scope.recipeDB[i].requiredItems);
        if (addMe) $scope.game.availableRecipes.push($scope.recipeDB[i]);
      }
    }
  };

  $scope.craftMe = function (recipe) { 
    var item = { 
      name: recipe.name, 
      img: recipe.img, 
      type: recipe.itemType, 
      description: recipe.description, 
      damage: recipe.damage,
      bonusHealth: recipe.bonusHealth, 
      speedPenalty: recipe.speedPenalty, 
      manaPenalty: recipe.manaPenalty,
      heal: recipe.heal,
      radius: recipe.radius,
      range: recipe.range,
      specialMoves: recipe.specialMoves,
      projectileClass: recipe.projectileClass  
    };
    var requiredItems = recipe.requiredItems.split("& ");
    for(var ri in requiredItems) {
      var itemNamesAndNumbers = requiredItems[ri].split(" ");
      var itemNumber = itemNamesAndNumbers[0];
      var itemName = itemNamesAndNumbers[1];
      for(var i = 0; i < itemNumber; i++) {
        for(var j in $scope.game.inventory) {
          if(itemName == $scope.game.inventory[j].name) {
            $scope.game.inventory.splice(j, 1);
            break;
          }
        }
      }
    }
    
    addToInventory(item);
    $scope.game.availableRecipes = [];
  };

  $scope.navToWorldMap = function () {
    $scope.newGame = false;
    $scope.activeView = 'showGame';
  };

  $scope.navToCharacters = function () {
    $scope.activeView = 'showCharacterView';
  };

  $scope.travel = function() {
      //figure out where the team is
      var leftTarget = $scope.game.team.left - 50;
      var rightTarget = $scope.game.team.left + 50;
      var topTarget = $scope.game.team.top - 50;
      var bottomTarget = $scope.game.team.top + 50;
      //highlight tiles to click
      $scope.game.tilesToHighlight = [];
      for(var i in $scope.game.tiles) {
        var tileLeft = $scope.game.tiles[i].left;
        var tileTop = $scope.game.tiles[i].top;
        if( tileLeft >= leftTarget && tileLeft <= rightTarget && tileTop >= topTarget && tileTop <= bottomTarget ) {
          if(!$scope.game.tiles[i].class.includes("ocean")) {
            $scope.game.tiles[i].class += " highlightTile";
            $scope.game.tilesToHighlight.push($scope.game.tiles[i]);
          }
        }
      }
  };

  var clearCombatTiles = function () {
    $scope.game.tilesToHighlight = [];
    for(var i in $scope.game.combatTiles) {
            $scope.game.combatTiles[i].class = $scope.game.combatTiles[i].class.replace("Move", "");
            $scope.game.combatTiles[i].class = $scope.game.combatTiles[i].class.replace("Attack", "");
        }
  };

  var findDistance = function(position1, position2) {
    var x1 = position1.left;
    var x2 = position1.top;
    var b1 = position2.left;
    var b2 = position2.top;
    return Math.sqrt( (x1-b1)*(x1-b1) + (x2-b2)*(x2-b2) );
  }

  var canReachTile = function(startingLocation, targetLocation) {
    var returnTile = undefined;
    var currentTile = startingLocation;
    for(var i = 0; i < startingLocation.speed; i++) {
      //build potentialMoves
      var sortedMoves = [];
      var potentialMoves = [
        { left: currentTile.left - 50, top: currentTile.top },
        { left: currentTile.left + 50, top: currentTile.top },
        { left: currentTile.left, top: currentTile.top - 50 },
        { left: currentTile.left, top: currentTile.top + 50 },
        { left: currentTile.left, top: currentTile.top }
      ];
      for(var x in potentialMoves) {
        if(!occupiedByCharacter(potentialMoves[x]) && !occupiedByEnemy(potentialMoves[x]) && !occupiedByObstacle(potentialMoves[x])) {
          sortedMoves.push(potentialMoves[x]);
        }
      }
      sortedMoves.sort(function(a, b) {
          var x1 = targetLocation.left;
          var y1 = targetLocation.top;
          var a1 = a.left;
          var a2 = a.top;
          var b1 = b.left;
          var b2 = b.top;
     	    var distanceA = Math.sqrt( (x1-a1)*(x1-a1) + (y1-a2)*(y1-a2) );
          var distanceB = Math.sqrt( (x1-b1)*(x1-b1) + (y1-b2)*(y1-b2) );
          return distanceA - distanceB;
        });
      currentTile = sortedMoves[0];
    }
    if(currentTile.left == targetLocation.left && currentTile.top == targetLocation.top) {
      returnTile = targetLocation;
    }
    return returnTile;
  }

  $scope.highlightCombat = function(combatOption) {
      clearCombatTiles();
      $scope.showCombatItems = false;
      $scope.showCombatSpecial = false;
      //figure out where the team is
      var highlightTile = "Move";
      $scope.combatMode = combatOption;
      if(combatOption == "attack") {
        highlightTile = "Attack";
      }
      var activePlayer = {};
      for(c in $scope.game.characters) {
        if($scope.activeTurn.name == $scope.game.characters[c].name) {
          activePlayer = $scope.game.characters[c];
        }
      }
      var multiplier = 1;
      if (combatOption == 'move') {
        multiplier = $scope.game.characters[findCharacterIndex()].speed - $scope.game.characters[findCharacterIndex()].movesTaken;
      } else {
        multiplier = $scope.game.characters[findCharacterIndex()].range;
      }
      var maxDistance = 50 * multiplier;
      //highlight tiles to click
      $scope.game.tilesToHighlight = [];
      $scope.potentialMoveTiles = [];
      for(var i in $scope.game.combatTiles) {
        var tileLeft = $scope.game.combatTiles[i].left;
        var tileTop = $scope.game.combatTiles[i].top;
        var position = {left: tileLeft, top: tileTop};
        var tileDistance = findDistance(position, activePlayer);
        if(tileDistance <= maxDistance) {
          if(combatOption == "attack") {
            if(!occupiedByObstacle(position)  && !occupiedByCharacter(position)) {
              $scope.game.combatTiles[i].class += highlightTile;
              $scope.game.tilesToHighlight.push($scope.game.combatTiles[i]);
            }
          } else {
            if(!occupiedByObstacle(position)  && !occupiedByCharacter(position) && !occupiedByEnemy(position)) {
              $scope.potentialMoveTiles.push($scope.game.combatTiles[i]);
            }
          }
        }
      }
      //clean up move tiles you cannot reach
      for(var x in $scope.potentialMoveTiles) {
        var tile = canReachTile(activePlayer, $scope.potentialMoveTiles[x]);
        if(tile) {
          $scope.game.combatTiles[tile.id - 1].class += "Move";
          $scope.game.tilesToHighlight.push(tile);
        }
      }
  };

  $scope.travelToHere = function(tile) {
      var tileFound = false;
      for(var i in $scope.game.tilesToHighlight) {
        if($scope.game.tilesToHighlight[i].id == tile.id && !tile.class.includes("ocean")) {
          tileFound = true;
        }
      }
      if(tileFound) {
        $scope.game.team.left = tile.left;
        $scope.game.team.top = tile.top;
        $scope.game.team.location = tile.class.replace(" highlightTile", "");
        
        for(var i in $scope.game.tiles) {
            $scope.game.tiles[i].class = $scope.game.tiles[i].class.replace(" highlightTile", "");
        }
        $scope.game.tilesToHighlight = [];
        nextTurn();
        if(checkIfLairExists()) {
          $scope.lairHere = true;
        } else {
          $scope.lairHere = false;
        }
      }
  };

  var findTile = function (tile) {
    var tileFound = false;
      for(var i in $scope.game.tilesToHighlight) {
        if($scope.game.tilesToHighlight[i].id == tile.id) {
          tileFound = true;
        }
      }
      return tileFound;
  };

  var findCharacterIndex = function () {
    for(var c in $scope.game.characters) {
        if($scope.activeTurn.name == $scope.game.characters[c].name) {
          return c;
        }
      }
      return 0;
  };

  var findEnemyIndex = function (tile) {
    var enemyIndex = null;
    for (var e in $scope.game.enemies) {
      if(tile.left == $scope.game.enemies[e].left && tile.top == $scope.game.enemies[e].top) {
        enemyIndex = e;
      }
    }
    return enemyIndex;
  };

  var findItemByName = function (itemName) {
    for(i in $scope.droppableItems) {
      if($scope.droppableItems[i].name == itemName) {
        return $scope.droppableItems[i];
      }
    }
  };

  var dropLairLoot = function() {
    var lair = findLairByLocation();
    logOverlandInfo("You bring in a mighty haul from the lair.  Make sure to check your inventory! <br>");
    if(lair) {
      if(lair.class == "slimepits") {
        var totalLoot = Math.round(Math.random() * 5) + 5;
        for(var i = 0; i < totalLoot; i++) {
          var randomPercent = getRandomPercent();
          var item = {};
          if(randomPercent < 25) {
            item = findItemByName("gel");
          } else if(randomPercent < 50) {
            item = findItemByName("slime");
          } else if(randomPercent < 75) {
            item = findItemByName("pudding");
          } else if(randomPercent < 85) {
            item = findItemByName("slime staff");
          } else if(randomPercent < 95) {
            item = findItemByName("pudding axe");
          } else {
            item =findItemByName("slime robe");
          }
          addToInventory(item);
        }        
      }
    }
  };

  var endCombat = function() {
    if($scope.numOfEncounters == $scope.encounterTally) {
      for(var i in $scope.game.characters) {
        var charNum = parseInt(i) + 1;
        $scope.game.characters[i].class = "avatar" + charNum;
      }
      $scope.activeView = 'showGame';
      logOverlandInfo("You have successfully defeated the enemies! <br>");
      if($scope.numOfEncounters > 1) {
        dropLairLoot();
      }
    } else {
      $scope.encounterTally++;
      $scope.nextEncounter();
    }
  };

  var dropLoot = function(enemyIndex) {
    var drops = $scope.game.enemies[enemyIndex].drops.split(" ");
    var numItem = drops[0];
    var itemName = drops[1];
    for(var i = 0; i < numItem; i++) {
      var item = findItemByName(itemName);
      if(item) {
        addToInventory(item);
      }
    }
    logCombatInfo("It drops " + numItem + " " + itemName + ". <br>");
  };

  var levelUp = function (characterIndex) {
    logCombatInfo($scope.game.characters[characterIndex].name + " levels up! <br>");
    
    $scope.game.characters[characterIndex].xp = 0;
    $scope.game.characters[characterIndex].level++;
    logOverlandInfo($scope.game.characters[characterIndex].name + " has leveled to level " + $scope.game.characters[characterIndex].level + ".<br>");
    calculateHealth(characterIndex);
    calculateMana(characterIndex);
    $scope.game.characters[characterIndex].pointsLeft += 3;
  };
  
  var giveExperience = function (enemyIndex, characterIndex) {
    var experienceGained = $scope.game.enemies[enemyIndex].xp - (10 * $scope.game.characters[characterIndex].level);
    if(experienceGained > 0) {
      logCombatInfo($scope.game.characters[characterIndex].name + " gains " + experienceGained + " experience. <br>");
      $scope.game.characters[characterIndex].xp += experienceGained;
      if($scope.game.characters[characterIndex].xp > 99) {
        levelUp(characterIndex);
      }
    }
  };

  var killEnemy = function(enemyIndex) {
    var turnToRemove = 0;
    for(var t in $scope.turnOrder) {
      if ($scope.turnOrder[t].name == $scope.game.enemies[enemyIndex].name) {
        turnToRemove = t;
      }
    }
    dropLoot(enemyIndex);
    giveExperience(enemyIndex, findCharacterIndex());
    $scope.turnOrder[turnToRemove].isDead = true;
    $scope.turnOrder[turnToRemove].class = "dead";
    $scope.game.enemies.splice(enemyIndex, 1);
    if($scope.game.enemies.length < 1) {
      endCombat();
    } 
  };

  var checkEnemyHealth = function (enemyIndex) {
    if($scope.game.enemies[enemyIndex].damageTaken >= $scope.game.enemies[enemyIndex].health) {
      logCombatInfo("And it dies! <br>");
      killEnemy(enemyIndex);
    }
  };

  var damageEnemy = function (enemyIndex, specialMultiplier) {
    var characterIndex = findCharacterIndex();
    $scope.game.characters[characterIndex].xp++;
    var damageMax = 1;
    var critMulti = 1;
    var attributeDamage = Math.floor($scope.game.characters[characterIndex].str / 2);
    if($scope.game.characters[characterIndex].range > 1) {
      attributeDamage = Math.floor($scope.game.characters[characterIndex].dex / 2);
    }
    if(Math.round(Math.random() * 99) + 1 > 95) {
          logCombatInfo($scope.game.characters[characterIndex].name + " <em>Crits!</em> <br>");
          critMulti = 2;
        }
    if($scope.game.characters[characterIndex].weapon && $scope.game.characters[characterIndex].weapon.damage > 0) {
      damageMax = Math.round(Math.random() * $scope.game.characters[characterIndex].weapon.damage);
    }
    var damageDelt = (damageMax + attributeDamage) * critMulti * specialMultiplier;
    $scope.game.enemies[enemyIndex].damageTaken += damageDelt;
    logCombatInfo("<span style='color: blue;'>" + $scope.game.characters[characterIndex].name + "</span> deals " + damageDelt + " to " + $scope.game.enemies[enemyIndex].name + ". <br>");
    //check if monster dies
    checkEnemyHealth(enemyIndex);
    $scope.hasAttacked = true;
  };

  var animateCharacterRangedAttack = function(targetTile, characterIndex, enemyIndex, success) {
    $scope.projectile.top = $scope.game.characters[characterIndex].top;
    $scope.projectile.left = $scope.game.characters[characterIndex].left;
    $scope.projectile.class = $scope.game.characters[characterIndex].weapon.projectileClass;
    var direction = findClosestPosition(targetTile);
    $scope.projectile.class += direction.name;
    $scope.showProjectile = true;
    function moveProjectile(targetTile, characterIndex, enemyIndex) {
      if(targetTile.top == $scope.projectile.top && targetTile.left == $scope.projectile.left) {
        success();
      } else {
        var closestPosition = findClosestPosition(targetTile);
        $scope.projectile.left = closestPosition.left;
        $scope.projectile.top = closestPosition.top;
        $timeout(function() { moveProjectile(targetTile, characterIndex, enemyIndex); }, 4);
      }
    };
    $timeout(function() { moveProjectile(targetTile, characterIndex, enemyIndex); }, 4);
  };

  var resolveAttack = function (tile) {
    var characterIndex = findCharacterIndex();
    var tileFound = findTile(tile);
    if(tileFound) {
      //find the enemyindex
      var enemyIndex = findEnemyIndex(tile);
      if($scope.game.characters[characterIndex].weapon && $scope.game.characters[characterIndex].weapon.range > 1) {
        if(enemyIndex){
          animateCharacterRangedAttack(tile, characterIndex, enemyIndex, function() {
            $scope.showProjectile = false;
            damageEnemy(enemyIndex, 1);
            clearCombatTiles();
            $scope.attackMode = false;
          });
        } else {
          logCombatInfo("No enemy in that square, try again! <br>");
        }
        clearCombatTiles();
        $scope.attackMode = false;
      } else {
        //damage the enemy
        if(enemyIndex) {
          damageEnemy(enemyIndex, 1);
        } else {
          logCombatInfo("No enemy in that square, try again! <br>");
        }
        clearCombatTiles();
        $scope.attackMode = false;
      }
    } else {
      logCombatInfo("Target not in range. <br>");
    }
  };

  var throwCombatItem = function (tile) {
    if(tile.class.includes("Attack")) {
      //determine what enemies are hit
      var characterIndex = findCharacterIndex();
      var multiplier = $scope.itemToThrow.radius;
      var leftTarget = tile.left - (50 * multiplier);
      var rightTarget = tile.left + (50 * multiplier);
      var topTarget = tile.top - (50 * multiplier);
      var bottomTarget = tile.top + (50 * multiplier);
      //blow up enemies
      for(var i in $scope.game.enemies) {
        if($scope.game.enemies[i].left >= leftTarget &&
          $scope.game.enemies[i].left <= rightTarget &&
          $scope.game.enemies[i].top >= topTarget &&
          $scope.game.enemies[i].top <= bottomTarget) {
          //damage Enemies
          var damageDealt = Math.round(Math.random() * $scope.itemToThrow.damage);
          $scope.game.enemies[i].damageTaken += damageDealt;
          logCombatInfo("<span style='color: blue;'>" + $scope.game.characters[characterIndex].name + "</span> deals " + damageDealt + " to " + $scope.game.enemies[i].name + ". <br>");
          checkEnemyHealth(i);
        }
      }
      //blow up allies... whoops!
      for(var c in $scope.game.characters) {
        if($scope.game.characters[c].left >= leftTarget &&
          $scope.game.characters[c].left <= rightTarget &&
          $scope.game.characters[c].top >= topTarget &&
          $scope.game.characters[c].top <= bottomTarget) {
          //damage Enemies
          var damageDealt = Math.round(Math.random() * $scope.itemToThrow.damage);
          $scope.game.characters[c].damageTaken += damageDealt;
          logCombatInfo("<span style='color: blue;'>" + $scope.game.characters[characterIndex].name + "</span> deals " + damageDealt + " to " + $scope.game.characters[c].name + ". <br>");
          if($scope.game.characters[c].health <= $scope.game.characters[c].damageTaken) {
            //oops blew up a friendly
            logCombatInfo($scope.game.characters[targetCharacterIndex].name + " has died! <br>");
            checkTeamStatus(c);
            if($scope.game.characters[c].name == $scope.activeTurn.name) {
              //blew myself up...
              $scope.hasAttacked = true;
              clearCombatTiles();
              $scope.game.inventory.splice($scope.itemToThrow.inventoryIndex, 1);
              $scope.itemToThow = {};
              $scope.doNextCombatRound(false);
            }
          }
        }
      }
      $scope.hasAttacked = true;
      clearCombatTiles();
      $scope.game.inventory.splice($scope.itemToThrow.inventoryIndex, 1);
      $scope.itemToThow = {};
    }
  };

  var performSpecialMove = function(tile) {
    $scope.activeSpecialMove.perform(tile);
    clearCombatTiles();
    $scope.attackMode = false;
  };

  $scope.resolveCombatAction = function (tile) {
    var activePlayerIndex = findCharacterIndex();
    if($scope.combatMode == "attack") {
      resolveAttack(tile);
    } else if($scope.combatMode == "move") {
      travelToHereCombat(tile);
    } else if($scope.combatMode == "useItem") {
      throwCombatItem(tile);
      $scope.game.characters[activePlayerIndex].xp++;
    } else if($scope.combatMode == "special") {
      performSpecialMove(tile);
      $scope.game.characters[activePlayerIndex].xp++;
    }
    if($scope.game.characters[activePlayerIndex].xp > 99) {
        levelUp(activePlayerIndex);
      }
  };

  var createNewMap = function() {
    var id = 1;
    $scope.game.tiles = [];
    for (var i = 0; i < 11; i++) {
      for(var q = 0; q < 11; q++) {
        var tile = {};
        tile.column = q;
        tile.row = i;
        tile.class = "ocean";
        if(i > 0 && i < 10 && q > 0 && q < 10) tile.class = "beach";
        if(i > 1 && i < 9 && q > 1 && q < 9) tile.class = "grassland";
        if(i > 2 && i < 8 && q > 2 && q < 8) tile.class = "forest";
        if(i > 3 && i < 7 && q > 3 && q < 7) tile.class = "mountain";
        if(i > 4 && i < 6 && q > 4 && q < 6) tile.class = "volcano";
        tile.top = (tile.row * 50) + 100;
        tile.left = (tile.column * 50) + 250;
        tile.id = id;
        id++;
        $scope.game.tiles.push(tile);
      }
    }
  };

  $scope.infoHover = function(objectName) {
    if("clear" == objectName) {
      $scope.infoBox = "";
      return;
    }

    if("ocean" == objectName) {
      $scope.infoBox = "This is an Ocean, isn't the water beautiful?";
      return;
    }

    if("beach" == objectName) {
      $scope.infoBox = "This is a Beach.  Lots of sand and sun, watch out for crabs!"
    }

    if("crafting" == objectName) {
      $scope.infoBox = "This is the Crafting Option.  Select this to start crafting stuff and to manage your inventory.";
      return;
    }

    if("harvesting" == objectName) {
      $scope.infoBox = "This is the Harvest Option.  Select this to start collecting material from the current tile.";
      return;
    } 

    if("characters" == objectName) {
      $scope.infoBox = "This is the Character Option.  Select this to level up your characters.";
      return;
    } 

    if("traveling" == objectName) {
      $scope.infoBox = "This is the Travel Option.  Select this to move to a different tile.";
      return;
    } 

    if("saving" == objectName) {
      $scope.infoBox = "This is the Save Game Option.  Select this to save your current game.";
      return;
    }

    if("loading" == objectName) {
      $scope.infoBox = "This is the Load Game Option.  Select this to abandon this game and load a different one!";
      return;
    }       
  };
  
  var calculateHealth = function (index) {
    var baseHealth = 3 + ($scope.game.characters[index].level * 2);
    var healthFromStr = Math.floor($scope.game.characters[index].str / 2);
    var healthFromArmor = 0; 
    if($scope.game.characters[index].armor) {
      healthFromArmor = $scope.game.characters[index].armor.bonusHealth;
    }
    var healthFromBoots = 0;
    if($scope.game.characters[index].boots) {
      healthFromBoots = $scope.game.character[index].boots.bonusHealth;
    }
    $scope.game.characters[index].health =  baseHealth + healthFromStr + healthFromArmor + healthFromBoots;
  };

  var calculateMana = function (index) {
    var baseMana = $scope.game.characters[index].level * 1;
    var manaFromInt = Math.floor($scope.game.characters[index].int / 2);
    var manaFromArmor = 0;
    if($scope.game.characters[index].armor) {
      manaFromArmor = $scope.game.characters[index].armor.bonusMana;
    }
    var manaFromBoots = 0;
    if($scope.game.characters[index].boots) {
      manaFromBoots = $scope.game.character[index].boots.bonusMana;
    }
    $scope.game.characters[index].mana = baseMana + manaFromInt + manaFromArmor + manaFromBoots;
  };

  var calculateSpeed = function(index) {
    var baseSpeed = 3;
    var speedFromArmor = 0;
    if($scope.game.character[index].armor) {
      speedFromArmor = $scope.game.character[index].armor.bonusSpeed;
    }
    var speedFromBoots = 0;
    if($scope.game.character[index].boots) {
      speedFromBoots = $scope.game.character[index].boots.bonusSpeed;
    }
    $scope.game.characters[index].speed = baseSpeed + speedFromArmor + speedFromBoots;
  };

  $scope.addAttribute = function(attribute, index) {
    if($scope.game.characters[index].pointsLeft > 0) {
      if ('str' == attribute) {
        $scope.game.characters[index].str++;
        $scope.game.characters[index].pointsLeft--;
        calculateHealth(index);
      }
      if ('dex' == attribute) {
        $scope.game.characters[index].dex++;
        $scope.game.characters[index].pointsLeft--;
      }
      if ('int' == attribute) {
        $scope.game.characters[index].int++;
        $scope.game.characters[index].pointsLeft--;
        calculateMana(index);
      }
    }
  };

  $scope.newGame = function() {
    $scope.game.name = "New Game";
    createNewMap();
    createTeam();
    createCharacters();
  	$scope.activeView = 'showCharacterView';
    $scope.newGame = true;
  };

  $scope.saveGame = function() {
    if (typeof(window.localStorage) !== "undefined") {
        window.localStorage.setItem($scope.game.name + "savedGame", JSON.stringify($scope.game));
    } else {
        $scope.infoBox = "This browser does not support storage! :(";
    }
  };

  $scope.loadGame = function() {
    $scope.savedGames = [];
    if (typeof(window.localStorage) !== "undefined") {
      for(var i in window.localStorage)  {
        if(i.includes("savedGame")) {
          var game = JSON.parse(window.localStorage[i]);
          $scope.savedGames.push(game);
        }
      }
      $scope.activeView = 'showLoad';
    } else {
        $scope.infoBox = "This browser does not support storage! :(";
    }
  };

  var checkForLair = function() {
    for(var i in $scope.game.lairs) {
      if($scope.game.team.left == $scope.game.lairs[i].left && $scope.game.team.top == $scope.game.lairs[i].top){
        $scope.lairHere = true;
        break;
      }
    }
  };

  $scope.loadThisGame = function (game) {
    $scope.game = game;
    checkForLair();
    $scope.activeView = 'showGame';
  };

  $scope.deleteSaveFile = function (game, index) {
      $scope.savedGames.splice(index, 1);
      window.localStorage.removeItem(game.name + "savedGame");
  };

  $scope.equipItem = function (item) {
    if("weapon" == item.type) {
      $scope.game.characters[$scope.characterToEquip].weapon = item;
      $scope.game.characters[$scope.characterToEquip].weaponEquipped = true;
      $scope.game.characters[$scope.characterToEquip].range = item.range;
      $scope.game.inventory.splice(item.inventoryIndex, 1);
    }
    if("armor" == item.type) {
      $scope.game.characters[$scope.characterToEquip].armor = item;
      $scope.game.characters[$scope.characterToEquip].armorEquipped = true;
      $scope.game.inventory.splice(item.inventoryIndex, 1);
      calculateHealth($scope.characterToEquip);
      calculateMana($scope.characterToEquip)
      calculateSpeed($scope.characterToEquip);
    }
    if("boots" == item.type) {
      $scope.game.characters[$scope.characterToEquip].boots = item;
      $scope.game.characters[$scope.characterToEquip].bootsEquipped = true;
      $scope.game.inventory.splice(item.inventoryIndex, 1);
      calculateHealth($scope.characterToEquip);
      calculateMana($scope.characterToEquip)
      calculateSpeed($scope.characterToEquip);
    }
    $scope.game.equipables = [];
    $scope.showEquipables = false;
  };

  $scope.equipArmor = function (characterIndex) {
    $scope.game.equipables = [];
    for(i in $scope.game.inventory) {
      if("armor" == $scope.game.inventory[i].type) {
        var item = $scope.game.inventory[i];
        item.inventoryIndex = i;
        $scope.game.equipables.push(item);
      }
    }
    $scope.showEquipables = true;
    $scope.characterToEquip = characterIndex;
  };

  $scope.unequipArmor = function (characterIndex) {
    addToInventory($scope.game.characters[characterIndex].armor);
    $scope.game.characters[characterIndex].armor = { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 };
    $scope.game.characters[characterIndex].armorEquipped = false;    
  };

  $scope.equipBoots = function (characterIndex) {
    $scope.game.equipables = [];
    for(i in $scope.game.inventory) {
      if("boots" == $scope.game.inventory[i].type) {
        var item = $scope.game.inventory[i];
        item.inventoryIndex = i;
        $scope.game.equipables.push(item);
      }
    }
    $scope.showEquipables = true;
    $scope.characterToEquip = characterIndex;
  };

  $scope.unequipBoots = function (characterIndex) {
    addToInventory($scope.game.characters[characterIndex].boots);
    $scope.game.characters[characterIndex].boots = {};
    $scope.game.characters[characterIndex].bootsEquipped = false;
  };

  $scope.equipWeapon = function (characterIndex) {
    $scope.game.equipables = [];
    for(i in $scope.game.inventory) {
      if("weapon" == $scope.game.inventory[i].type) {
        var item = $scope.game.inventory[i];
        item.inventoryIndex = i;
        $scope.game.equipables.push(item);
      }
    }
    $scope.showEquipables = true;
    $scope.characterToEquip = characterIndex;
  };

  $scope.unequipWeapon = function(characterIndex){
    addToInventory($scope.game.characters[characterIndex].weapon);
    $scope.game.characters[characterIndex].weapon = {};
    $scope.game.characters[characterIndex].weaponEquipped = false;
    $scope.game.characters[characterIndex].range = 1;
  };

  $scope.displayCombatItems = function() {
    $scope.combatItems = [];
    for(var i in $scope.game.inventory) {
      if($scope.game.inventory[i].type == "combatHeal" || $scope.game.inventory[i].type == "combatHarm") {
        var item = $scope.game.inventory[i];
        item.inventoryIndex = i;
        $scope.combatItems.push(item);
      }
    }
    $scope.showCombatItems = true;
    $scope.showComabtSpecial = false;
  };

  $scope.useCombatItem = function (item) {
    clearCombatTiles();
    $scope.combatMode = "useItem";
    var activePlayerIndex = findCharacterIndex();
    if(item.type == "combatHeal") {
      var newDamageTaken = $scope.game.characters[activePlayerIndex].damageTaken - item.heal;
      if(newDamageTaken > 0) {
        $scope.game.characters[activePlayerIndex].damageTaken = newDamageTaken;
      } else {
        $scope.game.characters[activePlayerIndex].damageTaken = 0;
      } 
      logCombatInfo("<span style='color: blue'>" + $scope.game.characters[activePlayerIndex].name 
      + "</span> heals <span style='color: green'>" + item.heal +"</span> health. <br>");
      $scope.game.inventory.splice(item.inventoryIndex, 1);
      $scope.showCombatItems = false;
      $scope.hasAttacked = true;
    } else if(item.type == "combatHarm") {
      //highlight the combat tiles
      var activePlayer = {};
      for(c in $scope.game.characters) {
        if($scope.activeTurn.name == $scope.game.characters[c].name) {
          activePlayer = $scope.game.characters[c];
        }
      }
      var multiplier = item.range;
      var leftTarget = activePlayer.left - (50 * multiplier);
      var rightTarget = activePlayer.left + (50 * multiplier);
      var topTarget = activePlayer.top - (50 * multiplier);
      var bottomTarget = activePlayer.top + (50 * multiplier);
      //highlight tiles to click
      $scope.game.tilesToHighlight = [];
      for(var i in $scope.game.combatTiles) {
        var tileLeft = $scope.game.combatTiles[i].left;
        var tileTop = $scope.game.combatTiles[i].top;
        var position = {left: tileLeft, top: tileTop};
        if( tileLeft >= leftTarget && tileLeft <= rightTarget && tileTop >= topTarget && tileTop <= bottomTarget ) {
          if(!occupiedByObstacle(position)) {
            $scope.game.combatTiles[i].class += "Attack";
            $scope.game.tilesToHighlight.push($scope.game.combatTiles[i]);
          }
        }
      }
      //set ItemToThrow
      $scope.itemToThrow = item;
    }
  };

  $scope.displaySpecial = function () {
    clearCombatTiles();
    $scope.specialMoves = [];
    var activeCharacterIndex = findCharacterIndex();
    $scope.combatMode = "special";
    $scope.showCombatSpecial = true;
    $scope.showCombatItems = false;
    //check it Item has special moves
    if($scope.game.characters[activeCharacterIndex].weaponEquipped) {
      var character = $scope.game.characters[activeCharacterIndex];
      for(var i in character.weapon.specialMoves) {
        var specialMove = findSpecialMoveByName(character.weapon.specialMoves[i]);
        var manaLeft = character.mana - character.manaSpent;
        if(specialMove.manaCost > manaLeft) {
          specialMove.disable = true;
        } else {
          specialMove.disable = false;
        }
        $scope.specialMoves.push(specialMove);
      }
    }
  };

  var findSpecialMoveByName = function (moveName) {
    var specialMove = undefined;
    for(var i in $scope.specialMovesDB) {
      if(moveName == $scope.specialMovesDB[i].name) {
        specialMove = $scope.specialMovesDB[i];
        break;
      }
    }
    return specialMove;
  };

  $scope.highlightSpecialMove = function(moveName) {
    //find the special move by name
    $scope.activeSpecialMove = findSpecialMoveByName(moveName);
    //perform the highlight
    if($scope.activeSpecialMove) {
      $scope.activeSpecialMove.highlight();
    }
  };

  var findLairByLocation = function() {
    var lair =  undefined;
    for(var i in $scope.game.lairs) {
      if($scope.game.lairs[i].left == $scope.game.team.left && $scope.game.lairs[i].top == $scope.game.team.top) {
        lair = $scope.game.lairs[i];
      }
    }
    return lair;
  };

  var generateLairEncounter = function() {
    clearCombatLog();
    var lair = findLairByLocation();
    drawEncounterMap(lair);
    drawEnemies(lair);
    drawObstacles(lair);
    drawCharacters();
    drawHazards(lair);
    positionCombatants();
    rollInitiative();
    $scope.showCombatItems = false;
    $scope.showCombatSpecial = false;
    $scope.activeView = 'showCombatView';
    $scope.doNextCombatRound(true);
  };

  $scope.raidLair = function() {
    var lair = findLairByLocation();
    if(lair) {
      if(lair.class == "slimepits") {
        $scope.numOfEncounters = 3;
        $scope.encounterTally = 1;
      } else if(lair.class == "crabbycove") {
        $scope.numOfEncounters = 3;
        $scope.encounterTally = 1;
      } else if(lair.class == "floodedcave") {
        $scope.numOfEncounters = 3;
        $scope.encounterTally = 1;
      }
      $scope.nextEncounter = function() {
        generateLairEncounter();
      };
      generateLairEncounter();
    }
  };

  $scope.enemyInfo = function(enemy) {
    var condition = "<span style='color:green'>healthy</span>";
    var percentHealthLeft = Math.round(((enemy.health - enemy.damageTaken) / enemy.health) * 100);
    if(percentHealthLeft < 25) {
      condition = "like it's about to <span style='color:red'>die</span>";
    } else if (percentHealthLeft < 50) {
      condition = "<span style='color:yellow'>hurt</span>";
    } else if (percentHealthLeft < 75) {
      condition = "<span style='color:lightgreen'>wounded</span>";
    }
    logCombatInfo("<span style='color: red'>" + enemy.name + "</span> looks " + condition + ". <br>");
  };

  $scope.itemInfo = function(item) {
    $scope.infoBox = item.description;
  };
});