using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SlenderBoi : MonoBehaviour {

    public GameObject player;
    public float startSpeed, speedIncrement, incrementTime, maxSpeed;
    
    private UnityEngine.AI.NavMeshAgent navAgent;
    private float timer;

	void Start () {
        if (player == null)
            player = GameObject.FindGameObjectWithTag("Player");

        navAgent = GetComponent<UnityEngine.AI.NavMeshAgent>();
        navAgent.speed = startSpeed;
        timer = 0;

        navAgent.SetDestination(player.transform.position);
	}
	
	void Update () {
        timer += Time.deltaTime;
        if(timer >= incrementTime && navAgent.speed < maxSpeed)
        {
            timer = 0;
            navAgent.speed += speedIncrement;

            if (navAgent.speed > maxSpeed)
                navAgent.speed = maxSpeed;
        }
        navAgent.SetDestination(player.transform.position);

    }
}
