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
  $scope.recipeDB = [
    { name: "glass", requiredItems: "2 sand ", itemType: "material", img: "./images/glass.png", description: "A brittle crafting material.  It requires a furnace." }, 
    { name: "sandstone", requiredItems: "2 sand ", itemType: "material", img: "./images/sandstone.png", description: "A useful but hard crafting material." },
    { name: "sandstone hut", requiredItems: "5 sandstone ", itemType: "structure", img: "./images/sandstonehut.png", description: "This structure will protect you from monsters at night!" },
    { name: "shell dagger", requiredItems: "1 driftwood & 1 shell ", itemType: "weapon", img: "./images/shelldagger.png", description: "This tiny shell dagger adds 1 damage.", damage: 2},
    { name: "beatin' stick", requiredItems: "1 driftwood & 1 carapace ", itemType: "weapon", img: "./images/driftwood.png", description: "A thick wooden club for smashing enemies.", damage: 3},
    { name: "shell armor", requiredItems: "2 gel & 2 shell ", itemType: "armor", img: "./images/shellarmor.png", description: "This lightweight armor helps new islanders survive.", bonusHealth: 2, speedPenalty: 0, manaPenalty: 0},
    { name: "carapace armor", requiredItems: "2 gel & 2 carapace ", itemType: "armor", img: "./images/carapacearmor.png", description: "This heavy armor protects its wearer at the cost of speed.", bonusHealth: 4, speedPenalty: 1, manaPenalty: 0},
    { name: "pearl", requiredItems: "5 clam ", itemType: "material", img: "./images/pearl.png", description: "A shiney pearl.  This is useful for crafting magical things."}
  ];

  $scope.droppableItems = [
    { name: "gel", img: "./images/gel.png", type:"material", description: "A sticky crafting material." },
    { name: "carapace", img: "./images/carapace.png", type:"material", description: "The hard exoskeleton of some beast." }
  ];

  var logOverlandInfo = function (htmlString) {
    $scope.overlandLog = $sce.trustAsHtml($scope.overlandLog + htmlString);
  };
  
  var logCombatInfo = function (htmlString) {
    $scope.combatInfo = $sce.trustAsHtml($scope.combatInfo + htmlString);
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
      { name: "Spike", class: "avatar1", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 } },
      { name: "Albert", class: "avatar2", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 } },
      { name: "Sandra", class: "avatar3", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 } },
      { name: "Coco", class: "avatar4", health: 5, str: 1, dex: 1, int: 1, mana: 1, speed: 3, pointsLeft: 3, level: 1, xp: 0, weaponEquipped: false, armorEquipped: false, bootsEquipped: false, armor: { bonusHealth: 0, speedPenalty: 0, manaPenalty: 0 } }
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
    if(randomPercent < 40) {
      item = undefined;
    } else if (randomPercent < 60) {
      item = { name: "sand", img: "./images/sand.png", type:"material", description: "A useful material for crafting." };
    } else if (randomPercent < 80) {
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
    for(var h in $scope.game.hazards) {
      if(unoccupiedPosition.top == $scope.game.hazards[h].top && unoccupiedPosition.left == $scope.game.hazards[h].left) {
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
    //loop through hazard
    for(var h in $scope.game.hazards) {
      if(unoccupiedPosition.top == $scope.game.hazards[h].top && unoccupiedPosition.left == $scope.game.hazards[h].left) {
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
    //then place hazards
    for(var h in $scope.game.hazards) {
      var unoccupiedPosition = findUnoccupiedPosition();
      $scope.game.hazards[h].left = unoccupiedPosition.left;
      $scope.game.hazards[h].top = unoccupiedPosition.top;
    }
  };

  var fetchRandomEnemy = function () {
    var enemy = {};
    var randomPercent = Math.round(Math.random() * 99) + 1;
    if($scope.game.team.location == "beach") {
      if(randomPercent < 45) {
        enemy = { 
          name: "Blue Jelly",
          class: "gel",
          health: 4,
          mana: 1,
          str: 2,
          dex: 2,
          int: 2,
          damage: 3,
          speed: 2,
          xp: 3,
          drops: "2 gel " 
        };
      } else {
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
          xp: 3,
          drops: "2 carapace "
        };
      }
    }
    return enemy;
  }

  var drawEnemies = function () {
    $scope.game.enemies = [];
    var numEnemies = Math.round(Math.random() * 4) + 2;
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

  var checkRange = function (targetCharacterIndex, activeEnemyIndex) {
    var inRange = false;
    var leftTarget = $scope.game.characters[targetCharacterIndex].left - 50;
    var rightTarget = $scope.game.characters[targetCharacterIndex].left + 50;
    var topTarget = $scope.game.characters[targetCharacterIndex].top - 50;
    var bottomTarget = $scope.game.characters[targetCharacterIndex].top + 50;
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

  var damageCharacter = function (targetCharacterIndex, activeEnemyIndex) {
    var damageDealt = Math.round(Math.random() * $scope.game.enemies[activeEnemyIndex].damage) + Math.floor($scope.game.enemies[activeEnemyIndex].str / 2);
    $scope.game.characters[targetCharacterIndex].damageTaken += damageDealt;
    logCombatInfo("<span style='color: red;'>" +$scope.game.enemies[activeEnemyIndex].name + "</span> deals " + damageDealt + " to " + $scope.game.characters[targetCharacterIndex].name + ". <br>");
    if($scope.game.characters[targetCharacterIndex].health <= $scope.game.characters[targetCharacterIndex].damageTaken) {
      //character is Dead
      for(t in $scope.turnOrder) {
        if($scope.game.characters[targetCharacterIndex].name == $scope.turnOrder[t].name) {
          logCombatInfo($scope.game.characters[targetCharacterIndex].name + " has died! <br>");
          $scope.game.characters[targetCharacterIndex].class = "dead";
          $scope.turnOrder[t].isDead = true;
          break;
        }
      }
      //check if team is dead
      for(t in $scope.turnOrder) {
        var teamDown = true;
        if($scope.turnOrder[t].isDead == false) {
          teamDown = false;
        }
      }
      if(teamDown) {
        gameOver();
      }
    }
    $scope.doNextCombatRound(false);
  };

  var travelToHereCombat = function(tile) {
      var characterIndex = findCharacterIndex();
      
      var tileFound = findTile(tile);
      if(tileFound) {
        console.log("tile has been found");
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
              console.log("not there yet, try to move again");
              if($scope.game.characters[characterIndex].left == tile.left && $scope.game.characters[characterIndex].top == tile.top) {
                console.log("tileLeft:" + tile.left);
                console.log("characterLeft:" + $scope.game.characters[characterIndex].left);
                console.log("tileLeft:" + tile.top);
                console.log("characterTop:" + $scope.game.characters[characterIndex].top);
                console.log("found it!  stop moving.");
                clearCombatTiles();
              } else {
                console.log("couldn't find it, try again");
                travelToHereCombat(tile);
              }
            } else {
              console.log("Outta moves.");
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

  var moveEnemy = function (targetCharacterIndex, activeEnemyIndex) {
    //list of valid moves
    var leftTarget = $scope.game.enemies[activeEnemyIndex].left - 50;
    var rightTarget = $scope.game.enemies[activeEnemyIndex].left + 50;
    var topTarget = $scope.game.enemies[activeEnemyIndex].top - 50;
    var bottomTarget = $scope.game.enemies[activeEnemyIndex].top + 50;
    //highlight tiles to click
    $scope.game.validMoves = [];
    for(var i in $scope.game.combatTiles) {
      var tileLeft = $scope.game.combatTiles[i].left;
      var tileTop = $scope.game.combatTiles[i].top;
      var position = {top: tileTop, left: tileLeft};
      if( tileLeft >= leftTarget && tileLeft <= rightTarget && tileTop >= topTarget && tileTop <= bottomTarget ) {
        if(!occupiedByHazard(position)  && !occupiedByEnemy(position)) {
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
        console.log("Enemy has moved.");
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
      damageCharacter(targetCharacterIndex, activeEnemyIndex);
      if(Math.round(Math.random() * 99) + 1 > 95) {
          logCombatInfo($scope.game.enemies[findEnemyIndex()].name + " <em>Crits!</em> <br>");
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
    clearCombatTiles();
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

  var drawHazards = function () {
      $scope.game.hazards = [];

      var numHazards = Math.round(Math.random() * 4) + 2;
      for(var i = 0; i < numHazards; i++) {
        var hazard = {};
        hazard.class = "rock hazard";
        hazard.left = 200;
        hazard.top = 50;
        $scope.game.hazards.push(hazard);
      }
  };

  var generateEncounter = function() {
    //starting encounter
    clearCombatLog();
    drawEncounterMap();
    drawEnemies();
    drawCharacters();
    drawHazards();
    positionCombatants();
    rollInitiative();
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
    var item = { name: recipe.name, img: recipe.img, type: recipe.itemType, description: recipe.description };
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
      //figure out where the team is
      var highlightTile = " highlightMove";
      if(combatOption == "attack") {
        highlightTile = " highlightAttack";
        $scope.game.attackMode = true;
      } else {
        $scope.game.attackMode = false;
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
          if(!occupiedByHazard(position)  && !occupiedByCharacter(position)) {
            $scope.game.combatTiles[i].class += highlightTile;
            $scope.game.tilesToHighlight.push($scope.game.combatTiles[i]);
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
      $scope.game.inventory.push(item);
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
    var experienceGained = $scope.game.enemies[enemyIndex].xp - $scope.game.characters[characterIndex].level;
    if(experienceGained > 0) {
      logCombatInfo($scope.game.characters[characterIndex].name + " gains " + experienceGained + " experience. <br>");
      $scope.game.characters[characterIndex].xp += experienceGained;
      if($scope.game.characters[characterIndex].xp > 9) {
        levelUp(characterIndex);
      }
    }
  };

  var killEnemy = function(enemyIndex) {
    //ToDo figure out item drop system
    var turnToRemove = 0;
    for(t in $scope.turOrder) {
      if ($scope.turnOrder[t].name == $scope.game.enemies[t].name) {
        turnToRemove = t;
      }
    }
    dropLoot(enemyIndex);
    giveExperience(enemyIndex, findCharacterIndex());
    $scope.turnOrder[turnToRemove].isDead = true;
    $scope.game.enemies.splice(enemyIndex, 1);
    if($scope.game.enemies.length < 1) {
      endCombat();
    } 
  };

  var damageEnemy = function (enemyIndex) {
    var characterIndex = findCharacterIndex();
    var damageMax = 1;
    if($scope.game.characters[characterIndex].weapon && $scope.game.characters[characterIndex].weapon.damage > 0) {
      damageMax = $scope.game.characters[characterIndex].weapon.damage;
    }
    var damageDelt = damageMax + Math.floor($scope.game.characters[characterIndex].str / 2);
    $scope.game.enemies[enemyIndex].damageTaken += damageDelt;
    logCombatInfo("<span style='color: blue;'>" + $scope.game.characters[characterIndex].name + "</span> deals " + damageDelt + " to " + $scope.game.enemies[enemyIndex].name + ". <br>");
    //check if monster dies
    if($scope.game.enemies[enemyIndex].damageTaken >= $scope.game.enemies[enemyIndex].health) {
      logCombatInfo("And it dies! <br>");
      killEnemy(enemyIndex);
    }
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
        damageEnemy(enemyIndex);
        if(Math.round(Math.random() * 99) + 1 > 95) {
          logCombatInfo($scope.game.characters[findCharacterIndex].name + " <em>Crits!</em> <br>");
          damageEnemy(enemyIndex);
        }
      } else {
        logCombatInfo("No enemy in that square, try again! <br>");
      }
      clearCombatTiles();
      $scope.attackMode = false;
    } else {
      logCombatInfo("Target not in range. <br>");
    }
  };

  $scope.resolveCombatAction = function (tile) {
    if($scope.game.attackMode == true) {
      resolveAttack(tile);
    } else {
      console.log("starting character movement");
      travelToHereCombat(tile);
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
    //handle this!
    if("weapon" == item.type) {
      $scope.game.characters[$scope.characterToEquip].weapon = item;
      $scope.game.characters[$scope.characterToEquip].weaponEquipped = true;
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
  };
});
