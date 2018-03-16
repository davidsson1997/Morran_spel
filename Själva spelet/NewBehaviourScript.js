@script RequireComponent( Rigidbody )

private var myTransform : Transform;
private var myRigidbody : Rigidbody;
private var desiredVelocity : Vector3;

var isGrounded : boolean = false;

var target : Transform;

var moveSpeed : float = 6.0;
var turnSpeed : float = 2.0;

var hitNormal : float = 20.0;

var shoulderMultiplier : float = 0.5;

var rayDistance : float = 5.0;

enum NPC
{
    Idle,
    FreeRoam,
    Chasing,
    RunningAway
}

var myState : NPC;

var minimumRange : float = 4.0;
var maximumRange : float = 45.0;

private var minimumRangeSqr : float;
private var maximumRangeSqr : float;

var terrainMaximumHeight : float = 5000.0;

var isNpcChasing : boolean = true;

var freeRoamTimer : float = 0.0;
var freeRoamTimerMax : float = 5.0;
var freeRoamTimerMaxRange : float = 1.5;
var freeRoamTimerMaxAdjusted : float = 5.0;

var calcDir : Vector3;

var isSlender  : boolean = true;

function Start()
{

    myTransform = transform;
    myRigidbody = GetComponent.<Rigidbody>();

    minimumRangeSqr = minimumRange * minimumRange;
    maximumRangeSqr = maximumRange * maximumRange;

    GetComponent.<Rigidbody>().freezeRotation = true;

    //calcDir = Random.onUnitSphere;
    //calcDir.y = myTransform.position.y;

    var freeRoamTimer : float = 1000;

    if ( isSlender )
    {
       InvokeRepeating( "TeleportEnemy", 60.0, 20.0 );
    }

}

function TeleportEnemy()
{
    CheckIfVisible();

    if ( !isVisible )
    {
       var  sqrDist : float = ( target.position - myTransform.position ).sqrMagnitude;

       if ( sqrDist > maximumRangeSqr + 25.0 )
       {

         var teleportDistance : float = maximumRange + 5.0;

         var rndDir : int = Random.Range( 0, 2 );

         if ( rndDir == 0 )
         {
          rndDir = -1;
         }

         //var terrainPosCheck : Vector3 = target.position + ( myTransform.right * teleportDistance ); 
         var terrainPosCheck : Vector3 = target.position + ( rndDir * target.right * teleportDistance ); 

         terrainPosCheck.y = terrainMaximumHeight;

         var hit : RaycastHit;

         if ( Physics.Raycast( terrainPosCheck, -Vector3.up, hit, Mathf.Infinity ) )
         {
          if ( hit.collider.gameObject.tag == "Ground" || hit.collider.gameObject.name == "Terrain" )
          {
              myTransform.position = hit.point + new Vector3( 0, 0.25, 0 );
          }
         }
       }
    }
}

var isVisible : boolean = false;

var offScreenDot : float = 0.8;

function Slender()
{
    CheckIfVisible();

    var  sqrDist : float = ( target.position - myTransform.position ).sqrMagnitude;

    if ( isVisible )
    {
       // Check the range
       if ( sqrDist > maximumRangeSqr )
       {
         myState = NPC.Chasing;
       }
       else
       {

         var hit : RaycastHit;

         if ( Physics.Linecast( myTransform.position, target.position, hit ) )
         {

          //Debug.Log( hit.collider.gameObject.name );

          Debug.DrawLine( myTransform.position, target.position, Color.blue );

          if ( hit.collider.gameObject.name == target.name )
          {
              myState = NPC.Idle;

              //decrease health here     
          }
          else
          {
              myState = NPC.Chasing;
          }
         }
       }

    }
    else // is NOT visible
    {
        if ( sqrDist > minimumRangeSqr )
        {
         myState = NPC.Chasing;
        }
        else
        {
         myState = NPC.Idle;
        }
    }  

}

function CheckIfVisible()
{
    var fwd : Vector3 = target.forward;
    var other : Vector3 = ( myTransform.position - target.position ).normalized;
    //var other : Vector3 = ( target.position - myTransform.position ).normalized;

    var dotProduct : float = Vector3.Dot( fwd, other );

    if ( dotProduct > offScreenDot )
    {
       isVisible = true;
    }
    else
    {
       isVisible = false;
    }

}

function MakeSomeDecisions()
{
    var  sqrDist : float = ( target.position - myTransform.position ).sqrMagnitude;

    //STATE IF STATMENTS
    if ( sqrDist > maximumRangeSqr )
    {
       if ( isNpcChasing )
       {
         myState = NPC.Chasing;
       }
       else
       {
         myState = NPC.FreeRoam;
       }
    }
    else if ( sqrDist < minimumRangeSqr )
    {
       if ( isNpcChasing )
       {
         myState = NPC.Idle;
       }
       else
       {
         myState = NPC.RunningAway;
       }
    }
    else
    {
       if ( isNpcChasing )
       {
         myState = NPC.Chasing;
       }
       else
       {
         myState = NPC.RunningAway;
       }
    }
}

function Update()
{
    if ( isSlender )
    {
       Slender();
    }
    else
    {
       MakeSomeDecisions();
    }

    switch( myState )
    {
       case NPC.Idle :
         myTransform.LookAt( target );
         desiredVelocity = new Vector3( 0, myRigidbody.velocity.y, 0 );
       break;

        case NPC.FreeRoam :
           freeRoamTimer += Time.deltaTime;

           if ( freeRoamTimer > freeRoamTimerMaxAdjusted )
           {
             freeRoamTimer = 0.0;
             freeRoamTimerMaxAdjusted = freeRoamTimerMax + Random.Range( -freeRoamTimerMaxRange, freeRoamTimerMaxRange );

             calcDir = Random.onUnitSphere;
             calcDir.y = 0.0; //myTransform.position.forward.y;
           }

           Moving( calcDir );

         //desiredVelocity = new Vector3( 0, myRigidbody.velocity.y, 0 );
       break;

       case NPC.Chasing :
         Moving( (target.position - myTransform.position).normalized );
       break;

       case NPC.RunningAway :
         Moving( (myTransform.position - target.position).normalized );
       break;
    }


    //Moving();
}

function Moving( lookDirection : Vector3)
{
    //rotation 
    //var lookDirection : Vector3 = (target.position - myTransform.position).normalized;

    var hit : RaycastHit;



    var leftRayPos : Vector3 = myTransform.position - ( myTransform.right * shoulderMultiplier );
    var rightRayPos : Vector3 = myTransform.position + (myTransform.right * shoulderMultiplier );

    if ( Physics.Raycast( leftRayPos, myTransform.forward,  hit, rayDistance )  )
    {
       if ( hit.collider.gameObject.tag != "Ground" )
       {
         Debug.DrawLine( leftRayPos, hit.point, Color.red );

         lookDirection += hit.normal * hitNormal;
       }
    }
    else if ( Physics.Raycast( rightRayPos, myTransform.forward,  hit, rayDistance )  )
    {
       if ( hit.collider.gameObject.tag != "Ground" )
       {
         Debug.DrawLine( rightRayPos, hit.point, Color.red );

         lookDirection += hit.normal * hitNormal;
       }
    }
    else
    {
       Debug.DrawRay( leftRayPos, myTransform.forward * rayDistance, Color.green );
       Debug.DrawRay( rightRayPos, myTransform.forward * rayDistance, Color.green );
    }

    var lookRot : Quaternion = Quaternion.LookRotation ( lookDirection );

    myTransform.rotation = Quaternion.Slerp( myTransform.rotation, lookRot, turnSpeed * Time.deltaTime );

    //movement
    //myTransform.position += myTransform.forward * moveSpeed * Time.deltaTime;
    desiredVelocity = myTransform.forward * moveSpeed;
    desiredVelocity.y = myRigidbody.velocity.y;
}

function FixedUpdate()
{
    if ( isGrounded )
    {
       myRigidbody.velocity = desiredVelocity;
    }
}

function OnCollisionEnter ( collision : Collision )
{
    if ( collision.collider.gameObject.tag == "Ground" || collision.collider.gameObject.name == "Terrain" )
    {
       isGrounded = true;
    }
}

function OnCollisionStay ( collision : Collision )
{
    if ( collision.collider.gameObject.tag == "Ground" || collision.collider.gameObject.name == "Terrain")
    {
       isGrounded = true;
    }
}

function OnCollisionExit ( collision : Collision ) 
{
    if ( collision.collider.gameObject.tag == "Ground" || collision.collider.gameObject.name == "Terrain")
    {
       isGrounded = false;
    }
}?