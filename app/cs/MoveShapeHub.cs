using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalR
{
    public class SuperSprintHub : Hub
    {
        // Is set via the constructor on each creation
        private Broadcaster _broadcaster;
        public SuperSprintHub() : this(Broadcaster.Instance)
        {

        }
        public SuperSprintHub(Broadcaster broadcaster)
        {
            _broadcaster = broadcaster;
        }
        public void UpdateModel(string lol)
        {
            //clientModel.LastUpdatedBy = Context.ConnectionId;
            // Update the shape model within our broadcaster
            _broadcaster.UpdateCar(string.Concat(lol, lol));
        }
    }
}