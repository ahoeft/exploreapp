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
  $scope.combatItems = [];
  $scope.projectile = {};
  $scope.specialMovesDB = [
    {
      name: "smash",
      highlight: function() {
        highlightBasicMeleeAttack();
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
            if(!occupiedByHazard(position) && !occupiedByCharacter(position) && !occupiedByEnemy(position) && isOnTheBoard(position)) {
              $scope.game.enemies[enemyIndex].left = targetLeft;
              $scope.game.enemies[enemyIndex].top = targetTop;
            }
            damageEnemy(enemyIndex, 2);
          } else {
            logCombatInfo("No enemy in that square, try again! <br>");
          }
        }
      },
      manaCost: 1
    }
  ];
  $scope.recipeDB = [
    { name: "glass", requiredItems: "2 sand ", itemType: "material", img: "./images/glass.png", description: "A brittle crafting material.  It requires a furnace." }, 
    { name: "sandstone", requiredItems: "2 sand ", itemType: "material", img: "./images/sandstone.png", description: "A useful but hard crafting material." },
    { name: "sandstone hut", requiredItems: "5 sandstone ", itemType: "structure", img: "./images/sandstonehut.png", description: "This structure will protect you from monsters at night!" },
    { name: "shell dagger", requiredItems: "1 driftwood & 1 shell ", itemType: "weapon", img: "./images/shelldagger.png", description: "This tiny shell dagger adds 1 damage.", damage: 2, range: 1},
    { name: "beatin' stick", requiredItems: "1 driftwood & 1 carapace ", itemType: "weapon", img: "./images/beatinstick.png", description: "A thick wooden club for smashing enemies.", damage: 3, range: 1, specialMoves: [ "smash" ]},
    { name: "crude bow", requiredItems: "1 driftwood & 1 gel ", itemType: "weapon", img: "./images/crudebow.png", description: "A simple ranged weapon for the dextrous.", damage: 3, range: 3},
    { name: "shell armor", requiredItems: "2 gel & 2 shell ", itemType: "armor", img: "./images/shellarmor.png", description: "This lightweight armor helps new islanders survive.", bonusHealth: 2, speedPenalty: 0, manaPenalty: 0},
    { name: "carapace armor", requiredItems: "2 gel & 2 carapace ", itemType: "armor", img: "./images/carapacearmor.png", description: "This heavy armor protects its wearer at the cost of speed.", bonusHealth: 4, speedPenalty: 1, manaPenalty: 0},
    { name: "pearl", requiredItems: "5 clam ", itemType: "material", img: "./images/pearl.png", description: "A shiney pearl.  This is useful for crafting magical things."},
    { name: "sandy salve", requiredItems: "1 sand & 1 gel ", itemType: "combatHeal", img: "./images/sandysalve.png", description: "Just... rub some dirt in that wound.", heal: 4},
    { name: "sandy salvo", requiredItems: "1 sand & 1 carapace ", itemType: "combatHarm", img: "./images/sandysalvo.png", description: "Ouch! Sand in the eyes! Thats gotta sting.", damage: 4, radius: 1, range: 1}
  ];//ToDo add sandy salve image; add sandy salvo image
  //starting items to test with
  $scope.game.inventory.push({ name: "crude bow", type: "weapon", img: "./images/crudebow.png", description: "A simple ranged weapon for the dextrous.", damage: 3, range: 3});
  $scope.game.inventory.push({name: "sandy salve", type: "combatHeal", img: "", description: "Just... rub some dirt in that wound.", heal: 4 });
  $scope.game.inventory.push({ name: "sandy salvo", requiredItems: "1 sand & 1 carapace ", type: "combatHarm", img: "", description: "Ouch! Sand in the eyes! Thats gotta sting.", damage: 4, range: 3, radius: 1});
  $scope.game.inventory.push({ name: "beatin' stick", requiredItems: "1 driftwood & 1 carapace ", type: "weapon", img: "./images/beatinstick.png", description: "A thick wooden club for smashing enemies.", damage: 3, range: 1, specialMoves: [ "smash" ] });
  $scope.game.inventory.push({ name: "beatin' stick", requiredItems: "1 driftwood & 1 carapace ", type: "weapon", img: "./images/beatinstick.png", description: "A thick wooden club for smashing enemies.", damage: 3, range: 1, specialMoves: [ "smash" ] });
  $scope.game.inventory.push({ name: "beatin' stick", requiredItems: "1 driftwood & 1 carapace ", type: "weapon", img: "./images/beatinstick.png", description: "A thick wooden club for smashing enemies.", damage: 3, range: 1, specialMoves: [ "smash" ] });
  $scope.game.inventory.push({ name: "beatin' stick", requiredItems: "1 driftwood & 1 carapace ", type: "weapon", img: "./images/beatinstick.png", description: "A thick wooden club for smashing enemies.", damage: 3, range: 1, specialMoves: [ "smash" ] });

  $scope.droppableItems = [
    { name: "gel", img: "./images/gel.png", type:"material", description: "A sticky crafting material." },
    { name: "carapace", img: "./images/carapace.png", type:"material", description: "The hard exoskeleton of some beast." },
    { name: "pearl", img: "./images/pearl.png", type:"material", description: "A beautiful gem said to be the tear of an angel." }
  ];

  var isOnTheBoard = function (position) {
    var onTheBoard = false;
    if(position.left >= 250 && position.left <= 700 && position.top >= 100 && position.top <= 550) {
      onTheBoard = true;
    }
    return onTheBoard;
  };

  var highlightBasicMeleeAttack = function () {
    var activePlayerIndex = findCharacterIndex();
        var activePlayer = $scope.game.characters[activePlayerIndex];
        var leftTarget = activePlayer.left - 50;
        var rightTarget = activePlayer.left + 50;
        var topTarget = activePlayer.top - 50;
        var bottomTarget = activePlayer.top + 50;
        //highlight tiles to click
        $scope.game.tilesToHighlight = [];
        for(var i in $scope.game.combatTiles) {
          var tileLeft = $scope.game.combatTiles[i].left;
          var tileTop = $scope.game.combatTiles[i].top;
          var position = {left: tileLeft, top: tileTop};
          if( tileLeft >= leftTarget && tileLeft <= rightTarget && tileTop >= topTarget && tileTop <= bottomTarget ) {
            if(!occupiedByHazard(position)  && !occupiedByCharacter(position)) {
              $scope.game.combatTiles[i].class += " highlightAttack";
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
      { name: "Spike", class: "avatar1", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 }, range: 1 },
      { name: "Albert", class: "avatar2", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 }, range: 1 },
      { name: "Sandra", class: "avatar3", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 }, range: 1 },
      { name: "Coco", class: "avatar4", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 }, range: 1 }
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

  var harvestBeach = function() {
    var item = {};
    var randomPercent = Math.round(Math.random() * 99) + 1;
    var randomAmount = Math.round(Math.random() * 2) + 1;
    if(randomPercent < 20) {
      item = undefined;
    } else if (randomPercent < 45) {
      item = { name: "sand", img: "./images/sand.png", type:"material", description: "A useful material for crafting." };
    } else if (randomPercent < 70) {
      item = { name: "shell", img: "./images/shell.png", type:"material", description: "A useful material for crafting." };
    } else if (randomPercent < 95) {
      item = { name: "driftwood", img: "./images/driftwood.png", type:"material", description: "A useful material for crafting." };
    } else {
      item = { name: "clam", img: "./images/clam.png", type:"material", description: "A useful material for crafting." };
    }
    if(item) {
      for(var i = 0; i < randomAmount; i++) {
        $scope.game.inventory.push(item);
      }
      logOverlandInfo("You successfully harvest " + randomAmount + " " + item.name + ". <br>");
    } else {
      logOverlandInfo("You search for hours but find nothing. <br>");
    } 
  };

  var drawEncounterMap = function () {
    var id = 1;
    $scope.game.combatTiles = [];
    for (var i = 0; i < 10; i++) {
      for(var q = 0; q < 10; q++) {
        var tile = {};
        tile.column = q;
        tile.row = i;
        tile.class = $scope.game.team.location + " combat";
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

  var occupiedByHazard = function (unoccupiedPosition) {
    var occupied = false;
    //loop through enemies
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
  };

  var fetchRandomEnemy = function () {
    var enemy = {};
    var randomPercent = Math.round(Math.random() * 99) + 1;
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
    return enemy;
  }

  var drawEnemies = function () {
    $scope.game.enemies = [];
    var numEnemies = Math.round(Math.random() * 4) + 1;
    if($scope.game.night == "night") {
      numEnemies = numEnemies * 2;
    }
    for(var n = 0; n < numEnemies; n++) {
      var enemy = fetchRandomEnemy();
      //set position to off the board
      enemy.name += " " + (n + 1);
      enemy.top = 50;
      enemy.left = 200;
      enemy.damageTaken = 0;
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
        if(targetTile.top < $scope.projectile.top && targetTile.left < $scope.projectile.left) {
          $scope.projectile.top--;
          $scope.projectile.left--;
        } else if(targetTile.top < $scope.projectile.top && targetTile.left > $scope.projectile.left) {
          $scope.projectile.top--;
          $scope.projectile.left++;
        } else if(targetTile.top > $scope.projectile.top && targetTile.left > $scope.projectile.left){
          $scope.projectile.top++;
          $scope.projectile.left++;
        } else if(targetTile.top > $scope.projectile.top && targetTile.left < $scope.projectile.left) {
          $scope.projectile.top++;
          $scope.projectile.left--;
        } else if(targetTile.top > $scope.projectile.top && targetTile.left == $scope.projectile.left) {
          $scope.projectile.top++;
        } else if(targetTile.top < $scope.projectile.top && targetTile.left == $scope.projectile.left) {
          $scope.projectile.top--;
        } else if(targetTile.top == $scope.projectile.top && targetTile.left < $scope.projectile.left) {
          $scope.projectile.left--;
        } else if(targetTile.top == $scope.projectile.top && targetTile.left > $scope.projectile.left) {
          $scope.projectile.left++;
        }
        $timeout(function() { moveProjectile(targetTile, targetCharacterIndex, activeEnemyIndex); }, 4);
      }
    };
    $timeout(function() { moveProjectile(targetTile, targetCharacterIndex, activeEnemyIndex); }, 4);
  };

  var checkRange = function (targetCharacterIndex, activeEnemyIndex) {
    var inRange = false;
    var enemyRange = $scope.game.enemies[activeEnemyIndex].range;
    var leftTarget = $scope.game.characters[targetCharacterIndex].left - (50 * enemyRange);
    var rightTarget = $scope.game.characters[targetCharacterIndex].left + (50 * enemyRange);
    var topTarget = $scope.game.characters[targetCharacterIndex].top - (50 * enemyRange);
    var bottomTarget = $scope.game.characters[targetCharacterIndex].top + (50 * enemyRange);
    var tileLeft = $scope.game.enemies[activeEnemyIndex].left;
    var tileTop = $scope.game.enemies[activeEnemyIndex].top;
    if (tileLeft >= leftTarget && tileLeft <= rightTarget && tileTop >= topTarget && tileTop <= bottomTarget) {
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
          logCombatInfo($scope.game.characters[targetCharacterIndex].name + " has died! <br>");
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
      checkTeamStatus(targetCharacterIndex);
    }
    $scope.doNextCombatRound(false);
  };

  var travelToHereCombat = function(tile) {
      var characterIndex = findCharacterIndex();
      
      var tileFound = findTile(tile);
      if(tileFound) {
        $scope.hasMoved = true;
        var leftTarget = $scope.game.characters[characterIndex].left - 50;
        var rightTarget = $scope.game.characters[characterIndex].left + 50;
        var topTarget = $scope.game.characters[characterIndex].top - 50;
        var bottomTarget = $scope.game.characters[characterIndex].top + 50;
        //find valid moves
        $scope.game.validMoves = [];
        for(var i in $scope.game.combatTiles) {
          var tileLeft = $scope.game.combatTiles[i].left;
          var tileTop = $scope.game.combatTiles[i].top;
          var position = {top: tileTop, left: tileLeft};
          if( tileLeft >= leftTarget && tileLeft <= rightTarget && tileTop >= topTarget && tileTop <= bottomTarget ) {
            if(!occupiedByHazard(position)  && !occupiedByCharacter(position) && !occupiedByEnemy(position)) {
              $scope.game.validMoves.push($scope.game.combatTiles[i]);
            }
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

  var moveEnemy = function (targetCharacterIndex, activeEnemyIndex) {
    //list of valid moves
    var leftTarget = $scope.game.enemies[activeEnemyIndex].left - 50;
    var rightTarget = $scope.game.enemies[activeEnemyIndex].left + 50;
    var topTarget = $scope.game.enemies[activeEnemyIndex].top - 50;
    var bottomTarget = $scope.game.enemies[activeEnemyIndex].top + 50;
    $scope.game.validMoves = [];
    for(var i in $scope.game.combatTiles) {
      var tileLeft = $scope.game.combatTiles[i].left;
      var tileTop = $scope.game.combatTiles[i].top;
      var position = {top: tileTop, left: tileLeft};
      if( tileLeft >= leftTarget && tileLeft <= rightTarget && tileTop >= topTarget && tileTop <= bottomTarget ) {
        if(!occupiedByHazard(position)  && !occupiedByEnemy(position)  && !occupiedByCharacter(position)) {
          $scope.game.validMoves.push($scope.game.combatTiles[i]);
        }
      }
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
    //find closest player
    var activeEnemy = {};
    var activeEnemyIndex = 0;
    for(e in $scope.game.enemies) {
      if($scope.activeTurn.name == $scope.game.enemies[e].name) {
        activeEnemy = $scope.game.enemies[e];
        activeEnemyIndex = e;
        break;
      }
    }
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

  $scope.doNextCombatRound = function (startingRound) {
    clearCombatTiles($scope.activeTurnIndex);
    if(startingRound == false) {
          console.log($scope.activeTurnIndex);
          if($scope.activeTurnIndex == $scope.turnOrder.length - 1) {
            $scope.activeTurnIndex = 0;
          } else {
            $scope.activeTurnIndex++;
          }
          $scope.activeTurn = $scope.turnOrder[$scope.activeTurnIndex];
          console.log($scope.activeTurn.name);
    }

    //Check if it is an enemies turn
    if($scope.activeTurn.type == "enemy") {
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
      $scope.hasAttacked = false;
      $scope.hasMoved = false;
      if($scope.activeTurn.isDead) {
        $scope.doNextCombatRound(false);
      } else {
        for(var c in $scope.game.characters) {
          if($scope.activeTurn.name == $scope.game.characters[c].name) {
            $scope.game.characters[c].movesTaken = 0;
          }
        }
      }
    }
  };

  var drawObstacles = function () {
      $scope.game.obstacles = [];

      var numHazards = Math.round(Math.random() * 10) + 10;
      for(var i = 0; i < numHazards; i++) {
        var obstacle = {};
        obstacle.class = "rock obstacle";
        obstacle.left = 200;
        obstacle.top = 50;
        $scope.game.obstacles.push(obstacle);
      }
  };

  var generateEncounter = function() {
    //starting encounter
    clearCombatLog();
    drawEncounterMap();
    drawEnemies();
    drawCharacters();
    drawObstacles();
    positionCombatants();
    rollInitiative();
    $scope.showCombatItems = false;
    $scope.showCombatSpecial = false;
    $scope.activeView = 'showCombatView';
    $scope.doNextCombatRound(true);
  };

  var checkForEncounter = function () {
    var randomPercent = Math.round(Math.random() * 99) + 1;
    if(randomPercent > 60 && $scope.game.night == "day") {
      generateEncounter();
    }
    if(randomPercent > 20 && $scope.game.night == "night") {
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
      specialMoves: recipe.specialMoves  
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
    
    $scope.game.inventory.push(item);
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
            $scope.game.combatTiles[i].class = $scope.game.combatTiles[i].class.replace(" highlightMove", "");
            $scope.game.combatTiles[i].class = $scope.game.combatTiles[i].class.replace(" highlightAttack", "");
        }
  };

  $scope.highlightCombat = function(combatOption) {
      clearCombatTiles();
      $scope.showCombatItems = false;
      $scope.showCombatSpecial = false;
      //figure out where the team is
      var highlightTile = " highlightMove";
      $scope.combatMode = combatOption;
      if(combatOption == "attack") {
        highlightTile = " highlightAttack";
      }
      var activePlayer = {};
      for(c in $scope.game.characters) {
        if($scope.activeTurn.name == $scope.game.characters[c].name) {
          activePlayer = $scope.game.characters[c];
        }
      }
      var multiplier = 1;
      if (combatOption == 'move') {
        multiplier = $scope.game.characters[findCharacterIndex()].speed;
      } else {
        multiplier = $scope.game.characters[findCharacterIndex()].range;
      }
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
          if(combatOption == "attack") {
            if(!occupiedByHazard(position)  && !occupiedByCharacter(position)) {
              $scope.game.combatTiles[i].class += highlightTile;
              $scope.game.tilesToHighlight.push($scope.game.combatTiles[i]);
            }
          } else {
            if(!occupiedByHazard(position)  && !occupiedByCharacter(position) && !occupiedByEnemy(position)) {
              $scope.game.combatTiles[i].class += highlightTile;
              $scope.game.tilesToHighlight.push($scope.game.combatTiles[i]);
            }
          }
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

  var endCombat = function() {
    for(var i in $scope.game.characters) {
      var charNum = parseInt(i) + 1;
      $scope.game.characters[i].class = "avatar" + charNum;
    }
    $scope.activeView = 'showGame';
    logOverlandInfo("You have successfully defeated the enemies! <br>");
  };

  var dropLoot = function(enemyIndex) {
    var drops = $scope.game.enemies[enemyIndex].drops.split(" ");
    var numItem = drops[0];
    var itemName = drops[1];
    for(var i = 0; i < numItem; i++) {
      var item = findItemByName(itemName);
      if(item) {
        $scope.game.inventory.push(item);
      } else {
        console.log("Couldn't find item.");
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

  var resolveAttack = function (tile) {
    var characterIndex = findCharacterIndex();
    var tileFound = findTile(tile);
    if(tileFound) {
      //find the enemyindex
      var enemyIndex = findEnemyIndex(tile);
      //damage the enemy
      if(enemyIndex) {
        damageEnemy(enemyIndex, 1);
      } else {
        logCombatInfo("No enemy in that square, try again! <br>");
      }
      clearCombatTiles();
      $scope.attackMode = false;
    } else {
      logCombatInfo("Target not in range. <br>");
    }
  };

  var throwCombatItem = function (tile) {
    if(tile.class.includes("highlightAttack")) {
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
            checkTeamStatus(c);
            if($scope.game.characters[c].name == $scope.activeTurn.name) {
              //blew myself up...
              $scope.hasAttacked = true;
              clearCombatTiles();
              $scope.game.inventory.splice($scope.itemToThrow.inventoryIndex, 1);
              $scope.itemToThow = {};
              doNextCombatRound(false);
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
  };

  $scope.resolveCombatAction = function (tile) {
    var activePlayerIndex = findCharacterIndex();
    if($scope.combatMode == "attack") {
      resolveAttack(tile);
      $scope.game.characters[activePlayerIndex].xp++;
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
    for (var i = 0; i < 10; i++) {
      for(var q = 0; q < 10; q++) {
        var tile = {};
        tile.column = q;
        tile.row = i;
        tile.class = "ocean";
        if(i > 0 && i < 9 && q > 0 && q < 9) tile.class = "beach";
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
    var healthFromArmor = $scope.game.characters[index].armor.bonusHealth;
    $scope.game.characters[index].health =  baseHealth + healthFromStr + healthFromArmor;
  };

  var calculateMana = function (index) {
    $scope.game.characters[index].mana = ($scope.game.characters[index].level * 1) + Math.floor($scope.game.characters[index].int / 2);
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

  $scope.loadThisGame = function (game) {
    $scope.game = game;
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
    }
    if("boots" == item.type) {
      $scope.game.characters[$scope.characterToEquip].boots = item;
      $scope.game.characters[$scope.characterToEquip].bootsEquipped = true;
      $scope.game.inventory.splice(item.inventoryIndex, 1);
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
    $scope.game.inventory.push($scope.game.characters[characterIndex].armor);
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
    $scope.game.inventory.push($scope.game.characters[characterIndex].boots);
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
    $scope.game.inventory.push($scope.game.characters[characterIndex].weapon);
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
          if(!occupiedByHazard(position)) {
            $scope.game.combatTiles[i].class += " highlightAttack";
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

  $scope.performSpecialMove = function(moveName) {
    //find the special move by name
    $scope.activeSpecialMove = findSpecialMoveByName(moveName);
    //perform the highlight
    if($scope.activeSpecialMove) {
      $scope.activeSpecialMove.highlight();
    }
  };
});
