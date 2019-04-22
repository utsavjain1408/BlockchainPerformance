import os
import json
from dateutil import parser
class TxnTimes:
    'This is txn times'
    def __init__(self, receive_time = 0, validate_time = 0, commmit_time = 0):
        self.receive_time = receive_time
        self.validate_time = validate_time
        self.commmit_time = commmit_time

class PeerContainer:
    '''This class objects can be used to information about the blockchain peers.
    It stores the peer name and the contents of the peer's log file.
    '''

    def __init__(self, name, log_file):
        '''An object can be initialized with the peer's name and the location of the log file. During initialization
        the log file is read and the contents are stored in the log_file object of the object.'''
        self.name = name
        self.log_file = []
        with open(log_file, 'r') as f:
            for line in f:
                self.log_file.append(json.loads(line))
        self.received_blocks = []
        self.validated_blocks = []
        self.comitted_blocks = []
        self.block_times = {}
        #make three dictionaries

    def __str__(self):
        return(str(self.name))
        
    def print_logs(self):
        ''' This method prints the contents of the log file line by line. '''
        for line in self.log_file:
            print(line)

    def find_received_block(self):
        ''' This method returns a lost of log lines which contains received block in them. '''
        received_logs = []
        for line in self.log_file:
            if(line['log'].find("Received")>0):
                received_logs.append(line)
        return(received_logs)
    
    def find_validated_block(self):
        '''  This method returns a lost of log lines which contains validated block in them. '''
        validated_logs = []
        for line in self.log_file:
            if(line['log'].find("Validated")>0):
                validated_logs.append(line)
        return(validated_logs)
    
    def find_commited_block(self):
        '''This method returns a lost of log lines which contains commited block in them.'''
        commit_logs = []
        for line in self.log_file:
            if(line['log'].find("Committed")>0):
                commit_logs.append(line)
        return(commit_logs)
    
def get_time(line):
    '''This method extracts the timestamp of the log line sent to it and returns a datetime object. '''
    return(parser.parse(line['log'][5:32]))

def time_to_commit(received_time, validated_time, commited_time):
    time_to_validate = validated_time - received_time
    time_to_commit = commited_time - validated_time
    return()
    
def set_blocks_info(peer):
        peer.received_blocks = peer.find_received_block()
        peer.validated_blocks = peer.find_validated_block()
        peer.comitted_blocks = peer.find_commited_block()

#Create a block Class


class Block:
    def __init__(self, block_number):
        self.__name__ = str(block_number)
        self.block_number = block_number
        self.peers_times = {}
        
    def add_peer(self, peer_name, block_receive_time, block_validated_time, block_commited_time):
        '''
            This involves getting the block receive time, block validated time and the block commit time.
        '''

        t = TxnTimes(block_receive_time, block_validated_time, block_commited_time)
        
        self.peers_times[peer_name] = t
        
        print('Adding %s with rt %s, vt %s and ct %s' %(peer_name, block_receive_time, block_validated_time, block_commited_time))
        
    def get_longest_commit_time():
        largest = self.peer.itervalues().next()[2]
        for peer_id, time_array in self.peer:
            if(time_array[2]):
                pass
    def print_block_info():
        print("Block Number %s" % self.block_number)
        print("Peer Informa")
    
    def get_smallest_commit_time():
        pass
    
    def get_propogation_time(self, peers):
        commit_times = []
        receive_times = []
        for peer in self.peers_times:
            commit_times.append(self.peers_times[peer].commmit_time)
            receive_times.append(self.peers_times[peer].receive_time)
        max_commit_time = max(commit_times)
        min_receive_time = min(receive_times)
        return(max_commit_time - min_receive_time)
