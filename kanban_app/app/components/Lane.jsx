import AltContainer from 'alt-container';
import React from 'react';
import Editable from './Editable.jsx';
import Notes from './Notes.jsx';
import LaneActions from '../actions/LaneActions';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import {DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteTarget = {
  hover(targetProps, monitor) {
    const targetId = targetProps.lane.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(!targetProps.lane.notes.length) {
      LaneActions.attachToLane({
        laneId: targetProps.lane.id,
        noteId: sourceId
      })
    }
  }
}

@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Lane extends React.Component {
  render() {
    const {connectDropTarget, lane, ...props} = this.props;

    return connectDropTarget(
      <div {...props}>
        <div className="lane-header" onClick={this.activateLaneEdit}>
          <div className="lane-add-note">
            <button onClick={this.addNote}>+</button>
          </div>
          <Editable className="lane-name" editing={lane.editing} onValueClick={this.activateLaneEdit}
            value={lane.name} onEdit={this.editName}/>
          <div className="lane-delete"><button onClick={this.deleteLane}>x</button></div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            notes: () => NoteStore.getNotesByIds(lane.notes)
          }}
          >
          <Notes onValueClick={this.activateNoteEdit} onEdit={this.editNote} onDelete={this.deleteNote} />
        </AltContainer>
      </div>
    );
  }

  editNote(id, task) {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      NoteActions.update({id, editing: false});
      return;
    }

    NoteActions.update({id, task, editing: false});
  }

  addNote = (e) => {
    e.stopPropagation();
    const laneId = this.props.lane.id;
    const note = NoteActions.create({task: 'New task', editing: true});

    LaneActions.attachToLane({
      noteId: note.id,
      laneId
    });
  };

  deleteNote = (noteId, e) => {
    e.stopPropagation();

    const laneId = this.props.lane.id;

    LaneActions.detachFromLane({laneId, noteId});
    NoteActions.delete(noteId);
  };

  editName = (name) => {
    const laneId = this.props.lane.id;

    if(!name.trim()) {
      LaneActions.update({id: laneId, editing: false});

      return;
    }

    LaneActions.update({id: laneId, name, editing: false});
    //console.log(`edit lane ${laneId} name using ${name}`);
  };

  deleteLane = () => {
    const laneId = this.props.lane.id;

    LaneActions.delete(laneId);
    //console.log(`delete lane ${laneId}`);
  };

  activateLaneEdit = (e) => {
    const laneId = this.props.lane.id;

    LaneActions.update({id: laneId, editing: true});
    //console.log(`activate lane ${laneId} edit`);
  };

  activateNoteEdit(id) {

    NoteActions.update({id: id, editing: true});
    //console.log(`activate note ${id} edit`);
  }
}
